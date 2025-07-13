document.addEventListener('DOMContentLoaded', () => {
/* -------- Desde el día actual en adelante */
  const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    document.getElementById('fecha').setAttribute('min', minDate);

/* ---------Seleccionar barberos o tatuadores -------- */

const servicioSelect  = document.getElementById('opciones');
  const profesionales   = document.querySelectorAll('.profesional');

  // Ocultar todos al iniciar
  profesionales.forEach(p => p.classList.add('d-none'));

  // Función que aplica el filtro
  const filtrarProfesionales = () => {
    const servicio = servicioSelect.value;       // "barberia" o "tatuajes"
    profesionales.forEach(card => {
      if (card.classList.contains(servicio)) {
        card.classList.remove('d-none');
      } else {
        card.classList.add('d-none');
      }
    });
  };

  // Ejecuta al cambiar
  servicioSelect.addEventListener('change', filtrarProfesionales);

  // Ejecuta una vez por si el select ya trae un valor inicial
  filtrarProfesionales();

/* --------Hacer Reservas ------------- */

  let usuario = null;

  /* ─── 1. PEDIR SESIÓN ────────────────────────────── */
  fetch('http://localhost:3000/api/usuario-sesion', {
    credentials: 'include'
  })
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (data && data.usuario) {
        usuario = data.usuario;            // <── ahora sí
        // Autocompletar
        document.getElementById('nombre').value  = usuario.nombre;
        document.getElementById('email').value   = usuario.email;
        document.getElementById('telefono').value= usuario.telefono;
        document.getElementById('fecha_nacimiento').value =
          usuario.fecha_nacimiento.slice(0, 10);
      }
    })
    .catch(err => console.error('Error sesión:', err));

  /* ─── 2. RESTO DEL CÓDIGO (sin cambios) ──────────── */
 /* … código anterior sin cambios … */

  const form = document.getElementById('formReserva');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
      usuario_id: usuario ? usuario.id : null,
      nombre:           document.getElementById('nombre').value,
      email:            document.getElementById('email').value,
      telefono:         document.getElementById('telefono').value,
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
      fecha:            document.getElementById('fecha').value,
      hora:             document.getElementById('hora').value,
      servicio:         document.getElementById('opciones').value,
      profesional:      document.querySelector('input[name="profesional"]:checked')?.value || '',
      observaciones:    document.getElementById('observaciones').value
    };

    fetch('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error('Falló la reserva');
      return res.json();
    })
    .then(() => {
      alert('Reserva registrada con éxito');

      /* ─── REINICIAR FORMULARIO ─── */
      form.reset();

      /* 1. Autocompletar de nuevo si el usuario está logueado */
      if (usuario) {
        document.getElementById('nombre').value  = usuario.nombre;
        document.getElementById('email').value   = usuario.email;
        document.getElementById('telefono').value= usuario.telefono;
        document.getElementById('fecha_nacimiento').value =
          usuario.fecha_nacimiento.slice(0, 10);
      }

      /* 2. Ocultar otra vez los profesionales y resetear select */
      servicioSelect.value = 'Seleccionar:';
      filtrarProfesionales();            // vuelve a aplicar filtro
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Hubo un problema al guardar la reserva');
    });
  });
});

