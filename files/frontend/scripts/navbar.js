// scripts/navbar.js

fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;

    const logoutButton = document.getElementById('logout');

    // Verifica si hay sesión activa
    fetch('https://proyecto-despligue.onrender.com/api/usuario-sesion',{headers: { 'x-session-id': sessionId }})
    .then(res => {
      if (res.ok) {
        if (logoutButton) logoutButton.style.display = 'block';
      } else {
        if (logoutButton) logoutButton.style.display = 'none';
      }
    });

    // Configura el botón de logout
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        fetch('https://proyecto-despligue.onrender.com/api/logout', {
          method: 'POST',
          headers: { 'x-session-id': sessionId }
        })
        .then(res => {
         if (res.ok) {
            localStorage.removeItem('sessionId');
            window.location.href = 'login.html';
          }
        });
      });
    }
  });
