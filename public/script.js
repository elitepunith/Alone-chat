const socket = io();
let username = localStorage.getItem("user");

/* LOGIN */
function login() {
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      localStorage.setItem("user", user.value);
      window.location = "chat.html";
    } else {
      alert("Invalid login");
    }
  });
}

/* SEND MESSAGE */
function send() {
  const msg = document.getElementById("msg").value;
  socket.emit("sendMessage", {
    sender: username,
    message: msg
  });
  document.getElementById("msg").value = "";
}

/* RECEIVE MESSAGE */
socket.on("receiveMessage", data => {
  const div = document.createElement("div");
  div.textContent = `${data.sender}: ${data.message}`;
  document.getElementById("messages").appendChild(div);
});
