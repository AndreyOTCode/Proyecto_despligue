/*frontend/scripts/registro.js */

document.getElementById('registroForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const telefono = document.getElementById('telefono').value;
      const email = document.getElementById('email').value;
      const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
      const contrasena = document.getElementById('contrasena').value;

      try {
        const res = await fetch('http://localhost:3000/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, telefono, email, fecha_nacimiento, contrasena })
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) {
          window.location.href = 'login.html';
        }
      } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
      }
    });