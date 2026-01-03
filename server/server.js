const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');
const { encrypt, decrypt } = require('./crypto');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Update last seen
    db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role, username: user.username });
});

// Admin: Create User
app.post('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role || 'user');
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "Username exists" });
    }
});

// Get My Chats
app.get('/api/chats', authenticateToken, (req, res) => {
    const chats = db.prepare(`
        SELECT c.id, c.type, c.name, 
        (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_time
        FROM chats c
        JOIN chat_members cm ON c.id = cm.chat_id
        WHERE cm.user_id = ?
    `).all(req.user.id);
    res.json(chats);
});

// Create Group
app.post('/api/chats', authenticateToken, (req, res) => {
    const { name, userIds } = req.body; // userIds is array of IDs
    const createChat = db.transaction(() => {
        const result = db.prepare("INSERT INTO chats (type, name) VALUES ('group', ?)").run(name);
        const chatId = result.lastInsertRowid;
        db.prepare("INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)").run(chatId, req.user.id); // Add self
        userIds.forEach(uid => {
            db.prepare("INSERT INTO chat_members (chat_id, user_id) VALUES (?, ?)").run(chatId, uid);
        });
        return chatId;
    });
    res.json({ chatId: createChat() });
});

// Get Messages (Decrypted)
app.get('/api/chats/:id/messages', authenticateToken, (req, res) => {
    // Security: Check if user belongs to chat
    const member = db.prepare('SELECT * FROM chat_members WHERE chat_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!member) return res.sendStatus(403);

    const messages = db.prepare('SELECT m.*, u.username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.chat_id = ? ORDER BY m.created_at ASC').all(req.params.id);
    
    // Decrypt messages before sending to frontend
    const decryptedMessages = messages.map(msg => ({
        ...msg,
        content: decrypt({ content: msg.content, iv: msg.iv })
    }));
    
    res.json(decryptedMessages);
});

// Get All Users (For creating groups/admin)
app.get('/api/users', authenticateToken, (req, res) => {
    const users = db.prepare('SELECT id, username, role, last_seen, is_active FROM users').all();
    res.json(users);
});

// --- Real-time Socket.io ---
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ chatId, token }) => {
        // Validate token inside socket for security
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.join(`chat_${chatId}`);
        } catch(e) { console.error("Socket auth failed"); }
    });

    socket.on('sendMessage', ({ chatId, content, token }) => {
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            const encrypted = encrypt(content);
            
            const result = db.prepare('INSERT INTO messages (chat_id, sender_id, content, iv) VALUES (?, ?, ?, ?)').run(chatId, user.id, encrypted.content, encrypted.iv);
            
            const messageData = {
                id: result.lastInsertRowid,
                chat_id: chatId,
                sender_id: user.id,
                username: user.username,
                content: content, // Send plain text back to clients in room
                created_at: new Date().toISOString()
            };

            io.to(`chat_${chatId}`).emit('receiveMessage', messageData);
        } catch(e) { console.error("Msg Error", e); }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Alone Server running on port ${process.env.PORT || 3000}`);
});