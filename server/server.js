const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");
const db = require("./db");
const { encrypt, decrypt } = require("./encryption");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) return res.json({ success: false });

      const ok = await bcrypt.compare(password, user.password);
      res.json({ success: ok });
    }
  );
});

/* SOCKET */
io.on("connection", (socket) => {
  socket.on("sendMessage", (data) => {
    const encrypted = encrypt(data.message);

    db.run(
      "INSERT INTO messages (sender, receiver, message) VALUES (?,?,?)",
      [data.sender, data.receiver, encrypted]
    );

    io.emit("receiveMessage", {
      sender: data.sender,
      message: encrypted
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Alone running on port ${PORT}`)
);
