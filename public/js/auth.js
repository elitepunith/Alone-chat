const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                
                if(data.role === 'admin') window.location.href = '/admin.html';
                else window.location.href = '/chat.html';
            } else {
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.innerText = "Server error";
            errorMsg.classList.remove('hidden');
        }
    });
}