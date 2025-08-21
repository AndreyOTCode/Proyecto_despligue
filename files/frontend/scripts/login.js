/* frontend/scripts/login.js */
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const res = await fetch('https://proyecto-despligue.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, contrasena })
    });

    const data = await res.json();

    // Mostrar toast
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = data.message;

    const toastEl = document.getElementById('loginToast');
    toastEl.classList.remove('text-bg-success', 'text-bg-danger');
    toastEl.classList.add(res.ok ? 'text-bg-success' : 'text-bg-danger');

    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    if (res.ok) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }

  } catch (err) {
    console.error(err);

    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = 'Error al conectar con el servidor';

    const toastEl = document.getElementById('loginToast');
    toastEl.classList.remove('text-bg-success');
    toastEl.classList.add('text-bg-danger');

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
});
