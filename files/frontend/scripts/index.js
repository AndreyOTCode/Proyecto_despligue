//frontend/scripts/index.js
document.addEventListener('DOMContentLoaded', async () => {
  const paginaActual = location.pathname;

  try {
    const res = await fetch('http://localhost:3000/api/usuario-sesion', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 401 || res.status === 403) {
      // Usuario no logueado
      if (!paginaActual.endsWith('index.html') && paginaActual !== '/') {
        location.href = 'index.html';
      }
      return;
    }

    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

    const { usuario, rol } = await res.json();
    console.log(`Bienvenido ${usuario.nombre} con rol: ${rol}`);

    // Insertar sección dependiendo del rol, solo si hay parallax o body
    const ref = document.querySelector('section.parallax-section') || document.body;

    if (rol === 'admin') {
      const seccionAdmin = document.createElement('section');
      seccionAdmin.innerHTML = `
        <div class="contenido-texto text-center contenedor zonaAdministrativa mt-5">
          <h2>Zona Administrativa</h2>
          <a href="admin.html" class="btn btn-outline-light">⚙️ Ir al panel</a>
        </div>`;
      ref.parentNode.insertBefore(seccionAdmin, ref);
    }

    if (rol === 'barbero' || rol === 'tatuador') {
      const seccionArtista = document.createElement('section');
      seccionArtista.className = 'contenido-reserva bg-dark text-light p-4';
      seccionArtista.innerHTML = `
        <div class="contenido-texto text-center contenedor mt-5">
          <h2>Zona de Citas (${rol})</h2>
          <p>Bienvenido, ${usuario.nombre}. Consulta y gestiona tus citas.</p>
          <div class="botones">
            <a href="consultaCitas.html" class="btn btn-outline-light m-1">Consultar Citas</a>
            <a href="DisponibilidadArtista.html" class="btn btn-outline-light m-1">Disponibilidad</a>
          </div>
        </div>`;
      ref.parentNode.insertBefore(seccionArtista, ref);
    }

    // 🔹 Nuevo: Mostrar acceso a citas si el usuario es cliente
    if (rol === 'cliente') {
      const seccionCliente = document.createElement('section');
      seccionCliente.className = 'contenido-reserva bg-dark text-light p-4';
      seccionCliente.innerHTML = `
        <div class="contenido-texto text-center contenedor mt-5">
          <h2>Mis Citas</h2>
          <p>Bienvenido, ${usuario.nombre}. Aquí puedes ver y gestionar tus citas.</p>
          <div class="botones">
            <a href="citas.html" class="btn btn-outline-light m-1">Ver/Cancelar Citas</a>
          </div>
        </div>`;
      ref.parentNode.insertBefore(seccionCliente, ref);
    }

  } catch (error) {
    console.error('Error al obtener sesión:', error);
    // Solo redirige en páginas protegidas
    if (!paginaActual.endsWith('index.html') && paginaActual !== '/') {
      location.href = 'login.html';
    }
  }
});
