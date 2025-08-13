//frontend/scripts/registro.js
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

    // Mostrar mensaje en toast
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = data.message;

    const toastEl = document.getElementById('registroToast');
    toastEl.classList.remove('text-bg-success', 'text-bg-danger');
    toastEl.classList.add(res.ok ? 'text-bg-success' : 'text-bg-danger');

    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    if (res.ok) {
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    }

  } catch (err) {
    console.error(err);

    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = 'Error al conectar con el servidor';

    const toastEl = document.getElementById('registroToast');
    toastEl.classList.remove('text-bg-success');
    toastEl.classList.add('text-bg-danger');

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
});
