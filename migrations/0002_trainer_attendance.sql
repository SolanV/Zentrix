CREATE TABLE IF NOT EXISTS trainer_attendance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  check_in TEXT NOT NULL,
  check_out TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trainer_attendance_trainer_id ON trainer_attendance(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_attendance_check_in ON trainer_attendance(check_in);
