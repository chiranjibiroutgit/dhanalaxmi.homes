-- Dhanalaxmi Group — Users Database (SQL)
-- This file stores registered users for sign up / sign in / panel access.
-- In production, replace this file with a real SQL database (MySQL/PostgreSQL)
-- and connect via backend API.

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT,               -- Only for email/password sign up (hashed in production)
    name TEXT,
    role TEXT DEFAULT 'property_owner',  -- super_admin | developer | property_owner
    panels TEXT DEFAULT '[]',            -- JSON array of accessible panel paths
    method TEXT DEFAULT 'email',         -- email | phone | google
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Seed default admin users (email/password method)
INSERT OR IGNORE INTO users (email, phone, password, name, role, panels, method, created_at)
VALUES
    ('lingarajroutwork@gmail.com', '+918917622925', 'dl_hash_12', 'Lingaraj Rout (Founder)', 'super_admin', '[ "/devs.panel", "/admin.panel", "/dev.edit.panel" ]', 'email', datetime('now')),
    ('chiranjibir987@gmail.com', '+917327859285', 'dl_hash_12', 'Chiranjibi (Developer)', 'developer', '[ "/devs.panel", "/admin.panel", "/dev.edit.panel" ]', 'email', datetime('now'));
