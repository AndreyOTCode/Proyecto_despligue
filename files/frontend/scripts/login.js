document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const contrasena = document.getElementById('contrasena').value;

      try {
        const res = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, contrasena })
        });

        const data = await res.json();
        alert(data.message);

        
        if (res.ok) {
           window.location.href = 'index.html';
        }
      } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
      }
    });