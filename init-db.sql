-- PostgreSQL Database Schema for School Attendance System
-- This replaces the SQLite schema with PostgreSQL-compatible syntax

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  grade VARCHAR(20),
  section VARCHAR(20),
  phone VARCHAR(20),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parent-Student links table
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

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(200) UNIQUE NOT NULL,
  gate_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Logs table
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

-- School Config table
CREATE TABLE IF NOT EXISTS school_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  school_name VARCHAR(200) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push Tokens table
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

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schema version table
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_archived ON students(is_archived);
CREATE INDEX IF NOT EXISTS idx_students_grade_section ON students(grade, section);

CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);

CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON parent_student_links(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_entry_time ON attendance_logs(entry_time);
CREATE INDEX IF NOT EXISTS idx_attendance_student_time ON attendance_logs(student_id, entry_time);

CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_push_tokens_parent_id ON push_tokens(parent_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Insert default school configuration
INSERT INTO school_config (id, school_name, latitude, longitude, radius_meters, timezone)
VALUES (1, 'Sto. Rosario National High School', 14.5995, 120.9842, 100, 'Asia/Manila')
ON CONFLICT (id) DO NOTHING;

-- Insert schema version
INSERT INTO schema_version (version) VALUES (2)
ON CONFLICT (version) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at BEFORE UPDATE ON push_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
