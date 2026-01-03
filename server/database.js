const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const db = new Database(path.join(__dirname, 'alone.db'));

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user', -- 'admin' or 'user'
    is_active INTEGER DEFAULT 1,
    last_seen DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- 'individual' or 'group'
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_members (
    chat_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY(chat_id) REFERENCES chats(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER,
    sender_id INTEGER,
    content TEXT, -- Encrypted content
    iv TEXT,      -- Encryption IV
    seen INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create default Admin if not exists (Password: admin123)
const adminCheck = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminCheck) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run('admin', hash, 'admin');
    console.log("⚠️ Default Admin created: username='admin', password='admin123'");
}

module.exports = db;