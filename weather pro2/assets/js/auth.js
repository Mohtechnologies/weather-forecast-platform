// auth.js — handles registration/login/logout using localStorage
(function () {
  // helpers
  function getUsers() {
    const raw = localStorage.getItem('wn_users') || '[]';
    try { return JSON.parse(raw); } catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem('wn_users', JSON.stringify(users)); }

  // register page
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;

      const users = getUsers();
      if (users.find(u => u.email === email)) {
        alert('An account with that email already exists.');
        return;
      }

      // NOTE: This stores a plaintext password for demo purposes.
      // For production, always use secure server-side authentication.
      users.push({ name, email, password });
      saveUsers(users);
      alert('Account created — you can sign in now.');
      window.location.href = 'index.html';
    });
  }

  // login page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Invalid email or password.');
        return;
      }

      localStorage.setItem('wn_isLoggedIn', 'true');
      localStorage.setItem('wn_currentUser', JSON.stringify({ name: user.name, email: user.email }));
      window.location.href = 'weather.html';
    });
  }

  // logout button (on weather page)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('wn_isLoggedIn');
      localStorage.removeItem('wn_currentUser');
      window.location.href = 'index.html';
      alert("Thanks for using Skymoh.")
    });
  }
})();
