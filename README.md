<p align="center">
  <img src="assets/banner.png" alt="Alone Chat – Secure. Private. Fast." />
</p>

# 💬 Alone-Chat

**A Private, Real-Time Chat Application**

🌐 **Live Demo:** [https://alone-chat.onrender.com/](https://alone-chat.onrender.com/)

---

## 📌 Overview

**Alone-Chat** is a private, real-time chat application built for secure communication between trusted users.
The platform does not support public sign-ups; instead, users and groups are managed internally to maintain privacy and control.

The project is fully deployed on cloud infrastructure and uses a production-grade database, making it suitable for real-world use and further extension.

---



## 🔐 Login Interface

<p align="center">
  <img src="assets/login.png" alt="Alone Chat Login Screen" width="800" />
</p>


---

## 🚀 Features

* 🔐 **Controlled Authentication**

  * No public registration
  * Users are created manually (admin-controlled)
  * Passwords securely hashed using bcrypt

* 💬 **Real-Time Messaging**

  * One-to-one private chats
  * Group chats
  * Instant message delivery via WebSockets

* 🗂️ **Persistent Chat History**

  * Messages stored in PostgreSQL
  * Chat history loads automatically when a conversation is opened

* 🟢 **Online / Offline Status**

  * Live user presence tracking
  * Instant status updates

* 🔁 **Auto Session Restore**

  * Logged-in users remain signed in after refresh
  * Smooth user experience using browser storage

* 🎨 **Modern & Responsive UI**

  * Glassmorphism-style login screen
  * Clean chat interface
  * Works on desktop and mobile devices

---

## 🧱 Tech Stack

### Frontend

* HTML5
* CSS3 (custom responsive design)
* Vanilla JavaScript
* Google Fonts & Material Icons

### Backend

* Node.js
* Express.js
* Socket.IO (WebSockets)
* bcryptjs (password hashing)

### Database

* PostgreSQL
* Neon (serverless PostgreSQL)

### Deployment

* Render (backend & hosting)
* Neon (database)

---

## 🌐 Live Deployment

The application is live and publicly accessible:

👉 **[https://alone-chat.onrender.com/](https://alone-chat.onrender.com/)**

* Backend hosted on **Render**
* Database hosted on **Neon**
* Environment variables used for secure credentials
* Fully cloud-deployed (not local-only)

---

## 🔑 Test Account (For Review & Testing)

You can use the following credentials to test the application:

```
Username: testing
Password: testing123
```

> This account is provided for testing purposes only.

---

## 🔄 How the System Works

1. User logs in via WebSocket connection
2. Server validates credentials using PostgreSQL and bcrypt
3. User joins a private Socket.IO room
4. Messages are:

   * Stored in the database
   * Delivered instantly to the receiver
5. Online status updates in real time
6. Session is restored automatically on page refresh

---

## 📂 Project Structure

```
alone-chat/
│
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Styling
│   └── script.js       # Client-side logic
│
├── database.js         # PostgreSQL setup & schema
├── server.js           # Express + Socket.IO server
├── package.json
├── package-lock.json
└── README.md
```

---

## 🧠 What I Learned

* Building real-time systems using WebSockets
* Secure authentication with password hashing
* Managing user sessions across refreshes
* Working with cloud-hosted PostgreSQL databases
* Debugging issues that appear only in production
* Deploying and maintaining a full-stack application

---

## 🚧 Future Improvements

* 🔒 End-to-End Encryption
* ✔️ Message delivery & read receipts
* 🧾 Message editing and deletion
* 👥 Group member management
* 📱 Progressive Web App (PWA) support

---

## 📜 License

This project is licensed under the **MIT License**.
You are free to use, modify, and learn from it.

---

## 👨‍💻 Author

**elitepunith**

---
