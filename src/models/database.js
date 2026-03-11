const { Pool } = require('pg');
const config = require('../config');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.currentVersion = 2;
  }

  /**
   * Initialize database connection pool
   * Logic: Use a robust connection for setup, then switch to pooled mode.
   */
  async initialize() {
    try {
      console.log('Initializing database connection...');

      // 1. Setup a temporary "Management" pool. 
      // We increase timeouts here to ensure migrations don't fail.
      const setupPool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 15000, // 15 seconds for setup
      });

      // Run Schema and Migrations using the setupPool
      await this.initializeSchema(setupPool);
      await this.runMigrations(setupPool);

      // Close the setup pool once migrations are done
      await setupPool.end();

      // 2. Initialize the permanent Application Pool
      // This pool will be used for all regular queries (SELECT/INSERT/etc)
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000, // Regular app queries should be fast
      });

      const client = await this.pool.connect();
      console.log('App Database connection pool established');
      client.release();

      return this.pool;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  async initializeSchema(activePool) {
    const client = await activePool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const versionResult = await client.query(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      
      if (versionResult.rows.length > 0) {
        console.log(`Schema version ${versionResult.rows[0].version} detected.`);
        return;
      }

      console.log('Creating initial database schema...');
      await client.query('BEGIN');

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

      await client.query(`
        CREATE TABLE IF NOT EXISTS parent_student_links (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
          student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          relationship VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(parent_id, student_id)
        );
      `);

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

      await client.query(`
        CREATE TABLE IF NOT EXISTS attendance_logs (
          id SERIAL PRIMARY KEY,
          student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          qr_code_id INTEGER NOT NULL REFERENCES qr_codes(id),
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          location_valid BOOLEAN NOT NULL,
          entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

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

      await client.query(`
        CREATE TABLE IF NOT EXISTS push_tokens (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
          device_token TEXT NOT NULL,
          platform VARCHAR(20) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(parent_id, device_token)
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.createIndexes(client);
      await this.insertDefaultConfig(client);

      await client.query('INSERT INTO schema_version (version) VALUES (1)');
      await client.query('COMMIT');
      console.log('Initial schema created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createIndexes(client) {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_students_email ON students(email)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_entry_time ON attendance_logs(entry_time)',
      'CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code)'
    ];
    for (const q of indexes) await client.query(q);
  }

  async insertDefaultConfig(client) {
    const res = await client.query('SELECT id FROM school_config WHERE id = 1');
    if (res.rows.length === 0) {
      await client.query(
        `INSERT INTO school_config (id, school_name, latitude, longitude, radius_meters, timezone)
         VALUES (1, $1, $2, $3, $4, 'UTC')`,
        [config.school.name, config.school.latitude, config.school.longitude, config.school.radiusMeters]
      );
    }
  }

  async runMigrations(activePool) {
    const currentVersion = await this.getSchemaVersion(activePool);
    if (currentVersion >= this.currentVersion) return;

    const client = await activePool.connect();
    try {
      await client.query('BEGIN');
      if (currentVersion < 2) {
        await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(20)');
        await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE');
        await client.query('CREATE INDEX IF NOT EXISTS idx_students_archived ON students(is_archived)');
        await client.query('INSERT INTO schema_version (version) VALUES (2)');
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSchemaVersion(activePool) {
    try {
      const res = await activePool.query('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1');
      return res.rows.length > 0 ? res.rows[0].version : 0;
    } catch (e) { return 0; }
  }

  // Helper Methods
  getConnection() {
    if (!this.pool) throw new Error('Database not initialized.');
    return this.pool;
  }

  async query(text, params = []) {
    const res = await this.pool.query(text, params);
    return res.rows;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

module.exports = new DatabaseManager();
