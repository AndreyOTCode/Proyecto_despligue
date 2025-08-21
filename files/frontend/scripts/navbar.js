// scripts/navbar.js

fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;

    const logoutButton = document.getElementById('logout');

    // Verifica si hay sesión activa
    fetch('https://proyecto-despligue.onrender.com/api/usuario-sesion', {
      method: 'GET',
      credentials: 'include'
    })
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
          credentials: 'include'
        })
        .then(res => {
          if (res.ok) {
            window.location.href = 'login.html';
          }
        });
      });
    }
  });
