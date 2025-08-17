document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/usuario-sesion', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('No autorizado');

    const { rol } = await res.json();

    if (rol !== 'admin') {
      alert('Acceso denegado. Esta zona es solo para administradores.');
      location.href = 'index.html';
    }
  } catch (err) {
    console.error(err);
    location.href = 'login.html';
  }
});
