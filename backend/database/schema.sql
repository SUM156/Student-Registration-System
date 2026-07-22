-- ============================================================================
-- backend/database/schema.sql
-- Database schema for the Student Registration System.
-- Run manually: mysql -u root -p < backend/database/schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS student_registration_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_registration_db;

-- Single table is sufficient for this domain (no joins needed yet).
-- If "courses" grows into its own managed entity later, extract a
-- `courses` table and reference it via course_id (see docs/ARCHITECTURE.md
-- "Future Roadmap") — kept denormalized for now since course names are
-- simple free text, not a separate managed resource in v1.
CREATE TABLE IF NOT EXISTS students (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  course        VARCHAR(100)  NOT NULL,
  enrollment_date DATE        NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  -- A student's email is how staff search/identify them — enforce
  -- uniqueness at the database level, not just in application code,
  -- since application-level checks alone can race under concurrent requests.
  CONSTRAINT uq_students_email UNIQUE (email)
) ENGINE=InnoDB;

-- Index on course speeds up the "filter by course" list endpoint
-- (see GET /api/students?course=...) without a full table scan.
CREATE INDEX idx_students_course ON students (course);
