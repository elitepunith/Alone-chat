const socket = io();
const token = localStorage.getItem('token');
const myUsername = localStorage.getItem('username');
let currentChatId = null;

if (!token) window.location.href = '/index.html';

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}

// Theme Toggle
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// DOM Elements
const chatList = document.getElementById('chatList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const emptyState = document.getElementById('emptyState');
const chatHeader = document.getElementById('chatHeader');
const inputArea = document.getElementById('inputArea');
const headerTitle = document.getElementById('headerTitle');

// Initial Load
loadChats();

async function loadChats() {
    const res = await fetch('/api/chats', { headers: { 'Authorization': token } });
    const chats = await res.json();
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition flex items-center space-x-3';
        div.onclick = () => openChat(chat.id, chat.name);
        div.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-white">
                ${chat.name ? chat.name[0].toUpperCase() : '#'}
            </div>
            <div>
                <div class="font-medium dark:text-gray-200">${chat.name || 'Chat'}</div>
                <div class="text-xs text-gray-500 truncate w-32">${chat.last_msg ? 'Encrypted message' : 'No messages yet'}</div>
            </div>
        `;
        chatList.appendChild(div);
    });
}

async function openChat(id, name) {
    currentChatId = id;
    emptyState.classList.add('hidden');
    chatHeader.classList.remove('hidden');
    messagesContainer.classList.remove('hidden');
    inputArea.classList.remove('hidden');
    headerTitle.innerText = name;
    
    // Join Socket Room
    socket.emit('joinRoom', { chatId: id, token });

    // Load Messages
    const res = await fetch(`/api/chats/${id}/messages`, { headers: { 'Authorization': token } });
    const messages = await res.json();
    renderMessages(messages);
}

function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => appendMessage(msg));
    scrollToBottom();
}

function appendMessage(msg) {
    const isMe = msg.username === myUsername;
    const div = document.createElement('div');
    div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
    
    div.innerHTML = `
        <div class="max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isMe 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
        }">
            ${!isMe ? `<div class="text-xs text-gray-400 mb-1">${msg.username}</div>` : ''}
            <div>${msg.content}</div>
            <div class="text-[10px] opacity-70 mt-1 text-right">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChatId) return;
    
    socket.emit('sendMessage', { chatId: currentChatId, content, token });
    messageInput.value = '';
}

// Socket Listener
socket.on('receiveMessage', (msg) => {
    if (msg.chat_id === currentChatId) {
        appendMessage(msg);
        scrollToBottom();
    }
});

// Utilities
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners
sendBtn.onclick = sendMessage;
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});