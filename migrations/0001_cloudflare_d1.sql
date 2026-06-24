PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS membership_plans (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  bio TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  date_of_birth TEXT,
  address TEXT,
  plan_id TEXT REFERENCES membership_plans(id) ON DELETE SET NULL,
  join_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  membership_start TEXT,
  membership_end TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES membership_plans(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL DEFAULT ('INV-' || lower(hex(randomblob(4)))),
  amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT,
  due_date TEXT,
  paid_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in TEXT NOT NULL,
  check_out TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  trainer_id TEXT REFERENCES trainers(id) ON DELETE SET NULL,
  day_of_week TEXT,
  start_time TEXT,
  end_time TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  booked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'booked',
  UNIQUE(class_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_plan_id ON members(plan_id);
CREATE INDEX IF NOT EXISTS idx_members_membership_end ON members(membership_end);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in);
CREATE INDEX IF NOT EXISTS idx_classes_trainer_id ON classes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_class_id ON class_bookings(class_id);
