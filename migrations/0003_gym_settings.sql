CREATE TABLE IF NOT EXISTS gym_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  gym_name TEXT NOT NULL DEFAULT 'Zentrix',
  location TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  email_reminders_enabled INTEGER NOT NULL DEFAULT 1,
  reminder_template_7_days TEXT DEFAULT 'Hello {name}, your membership for plan {plan} expires in 7 days on {expiry_date}. Please renew to continue enjoying our services.',
  reminder_template_today TEXT DEFAULT 'Hello {name}, your membership for plan {plan} expires today on {expiry_date}. Please renew to continue enjoying our services.',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO gym_settings (id, gym_name, location, phone, email, email_reminders_enabled)
VALUES ('default', 'Zentrix', 'Amravati, Maharashtra', '+91 98765 43210', 'admin@zentrix.in', 1);
