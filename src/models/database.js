const { Pool } = require('pg');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.currentVersion = 2;
  }

  /**
   * Initialize database connection pool
   */
  async initialize() {
    try {
      // Create connection pool
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      console.log('Database connection established');
      client.release();

      // Initialize schema
      await this.initializeSchema();

      // Run migrations
      await this.runMigrations();

      console.log('Database initialized successfully');
      return this.pool;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Create initial database schema
   */
  async initializeSchema() {
    const client = await this.pool.connect();
    
    try {
      // Create schema_version table for migration tracking
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if schema already exists
      const versionResult = await client.query(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      
      if (versionResult.rows.length > 0) {
        console.log(`Database schema version ${versionResult.rows[0].version} already exists`);
        return;
      }

      console.log('Creating initial database schema...');

      // Begin transaction
      await client.query('BEGIN');

      // Students table
      await client.query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          student_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          grade VARCHAR(20),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Parents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS parents (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Parent-Student links table
      await client.query(`
        CREATE TABLE IF NOT EXISTS parent_student_links (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          relationship VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          UNIQUE(parent_id, student_id)
        );
      `);

      // QR Codes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id SERIAL PRIMARY KEY,
          code VARCHAR(200) UNIQUE NOT NULL,
          gate_name VARCHAR(100) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
        );
      `);

      // Attendance Logs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS attendance_logs (
          id SERIAL PRIMARY KEY,
          student_id INTEGER NOT NULL,
          qr_code_id INTEGER NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          location_valid BOOLEAN NOT NULL,
          entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
        );
      `);

      // School Config table
      await client.query(`
        CREATE TABLE IF NOT EXISTS school_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          school_name VARCHAR(200) NOT NULL,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          radius_meters INTEGER NOT NULL,
          timezone VARCHAR(50) DEFAULT 'UTC',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Push Tokens table
      await client.query(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER NOT NULL,
          device_token TEXT NOT NULL,
          platform VARCHAR(20) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
          UNIQUE(parent_id, device_token)
        );
      `);

      // Admins table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await this.createIndexes(client);

      // Insert default school configuration
      await this.insertDefaultConfig(client);

      // Record schema version
      await client.query('INSERT INTO schema_version (version) VALUES ($1)', [1]);

      // Commit transaction
      await client.query('COMMIT');
      console.log('Initial schema created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create database indexes for performance optimization
   */
  async createIndexes(client) {
    console.log('Creating database indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)',
      'CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email)',
      'CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON parent_student_links(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON parent_student_links(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_entry_time ON attendance_logs(entry_time)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_student_time ON attendance_logs(student_id, entry_time)',
      'CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code)',
      'CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_push_tokens_parent_id ON push_tokens(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)',
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }

    console.log('Indexes created successfully');
  }

  /**
   * Insert default school configuration
   */
  async insertDefaultConfig(client) {
    const result = await client.query('SELECT id FROM school_config WHERE id = 1');
    
    if (result.rows.length === 0) {
      console.log('Inserting default school configuration...');
      await client.query(
        `INSERT INTO school_config (id, school_name, latitude, longitude, radius_meters, timezone)
         VALUES (1, $1, $2, $3, $4, 'UTC')`,
        [
          config.school.name,
          config.school.latitude,
          config.school.longitude,
          config.school.radiusMeters
        ]
      );
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion >= this.currentVersion) {
      console.log('Database is up to date');
      return;
    }

    console.log(`Running migrations from version ${currentVersion} to ${this.currentVersion}...`);

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Define migrations
      const migrations = [
        {
          version: 2,
          up: async () => {
            // Add section field to students table
            await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(20)');
            // Add is_archived field to students table
            await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE');
            // Create index for archived status
            await client.query('CREATE INDEX IF NOT EXISTS idx_students_archived ON students(is_archived)');
            // Create index for grade and section filtering
            await client.query('CREATE INDEX IF NOT EXISTS idx_students_grade_section ON students(grade, section)');
            console.log('Added section and is_archived fields to students table');
          }
        }
      ];

      // Run pending migrations
      for (const migration of migrations) {
        if (migration.version > currentVersion) {
          console.log(`Applying migration ${migration.version}...`);
          await migration.up();
          await client.query('INSERT INTO schema_version (version) VALUES ($1)', [migration.version]);
        }
      }

      await client.query('COMMIT');
      console.log('Migrations completed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get current schema version
   */
  async getCurrentVersion() {
    try {
      const result = await this.pool.query(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      return result.rows.length > 0 ? result.rows[0].version : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get database connection pool
   */
  getConnection() {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Close database connection pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection pool closed');
    }
  }

  /**
   * Execute a query with error handling
   */
  async query(text, params = []) {
    try {
      const result = await this.pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute a single row query with error handling
   */
  async queryOne(text, params = []) {
    try {
      const result = await this.pool.query(text, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Query execution failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient() {
    return await this.pool.connect();
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;
