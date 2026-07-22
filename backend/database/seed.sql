-- ============================================================================
-- backend/database/seed.sql
-- Sample data for local development. NEVER run this against production.
-- Run: mysql -u root -p student_registration_db < backend/database/seed.sql
-- ============================================================================

USE student_registration_db;

INSERT INTO students (full_name, email, phone, course, enrollment_date) VALUES
  ('Ali Raza',    'ali.raza@example.com',    '+92-300-1234567', 'BS Computer Science',            '2026-01-15'),
  ('Sana Khan',   'sana.khan@example.com',   '+92-301-2345678', 'BS Information Technology',      '2026-01-16'),
  ('Ahmed Ali',   'ahmed.ali@example.com',   '+92-302-3456789', 'BS Software Engineering',         '2026-01-17')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
