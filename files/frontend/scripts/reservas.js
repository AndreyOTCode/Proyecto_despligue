//frontend/scripts/reservas.js

document.addEventListener('DOMContentLoaded', () => {
  /* -------- Desde el día actual en adelante -------- */
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;
  const errorHora = document.getElementById('error_hora');
  const inputFecha = document.getElementById('fecha');
  inputFecha.setAttribute('min', minDate);


  /* -------- Validación de hora -------- */
  const inputHora = document.getElementById('hora');
  inputHora.addEventListener('input', () => {
    const valor = inputHora.value;
    if (!valor) return;

    const [hora, minuto] = valor.split(':').map(Number);

    const esManana = hora >= 8 && hora < 12;
    const esTarde = hora >= 14 && hora < 19;

      if (!(esManana || esTarde)) {
    errorHora.textContent = "El horario válido es de 8am a 12pm y de 2pm a 7pm.";
    inputHora.value = ""; // opcional: limpiar el input
  } else {
    errorHora.textContent = ""; // limpiar error si es válido
  }
  });

  /* -------- Seleccionar barberos o tatuadores -------- */
  const servicioSelect = document.getElementById('opciones');
  let profesionales = []; // Se llenará dinámicamente

  const filtrarProfesionales = () => {
    const servicio = servicioSelect.value; // "barbero" o "tatuador"
    profesionales.forEach(card => {
      if (servicio && card.classList.contains(servicio)) {
        card.classList.remove('d-none');
      } else {
        card.classList.add('d-none');
      }
    });
  };

  servicioSelect.addEventListener('change', filtrarProfesionales);

  async function cargarProfesionales() {
    try {
      const res = await fetch('https://proyecto-despligue.onrender.com/api/usuarios/artistas', {
        credentials: 'include'
      });
      const artistas = await res.json();
      const contenedor = document.getElementById('contenedor-profesionales');
      contenedor.innerHTML = ''; // Limpiar antes de agregar

      artistas.forEach(artista => {
        const col = document.createElement('div');
        col.className = `profesional col d-none ${artista.rol}`;

        let fotoSrc = artista.foto && artista.foto.trim() !== '' ? artista.foto : '/uploads/fotos_usuarios/default.png';

        col.innerHTML = `
          <div class="card h-100 text-center shadow-sm position-relative p-2">
            <div class="form-check position-absolute" style="top: 8px; right: 8px;">
              <input class="form-check-input" type="radio" name="profesional" value="${artista.nombre}" id="prof-${artista.nombre}">
              <label class="form-check-label" for="prof-${artista.nombre}"></label>
            </div>
            <img src="${fotoSrc}" 
                class="card-img-top mx-auto mt-3" 
                style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%;" 
                alt="${artista.nombre}">
            <div class="card-body d-flex flex-column justify-content-center">
              <h5 class="card-title mt-3">${artista.nombre}</h5>
            </div>
          </div>
        `;

        contenedor.appendChild(col);
      });

      profesionales = Array.from(document.querySelectorAll('.profesional'));
      filtrarProfesionales();
    } catch (err) {
      console.error('Error cargando profesionales:', err);
    }
  }

  cargarProfesionales();

  /* -------- Hacer Reservas -------- */
  let usuario = null;

  fetch('https://proyecto-despligue.onrender.com/api/usuario-sesion', {
    credentials: 'include'
  })
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (data?.usuario) {
        usuario = data.usuario;
        document.getElementById('nombre').value  = usuario.nombre || '';
        document.getElementById('email').value   = usuario.email || '';
        document.getElementById('telefono').value= usuario.telefono || '';
        document.getElementById('fecha_nacimiento').value =
          usuario.fecha_nacimiento?.slice(0, 10) || '';
      }
    })
    .catch(err => console.error('Error sesión:', err));

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
      servicio:         servicioSelect.value,
      profesional:      document.querySelector('input[name="profesional"]:checked')?.value || '',
      observaciones:    document.getElementById('observaciones').value
    };

    fetch('https://proyecto-despligue.onrender.com/api/reservas', {
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

  // 🔹 Limpiar el formulario completo
  form.reset();

  // 🔹 Volver a mostrar los datos del usuario si está en sesión
  if (usuario) {
    document.getElementById('nombre').value  = usuario.nombre;
    document.getElementById('email').value   = usuario.email;
    document.getElementById('telefono').value= usuario.telefono;
    document.getElementById('fecha_nacimiento').value =
      usuario.fecha_nacimiento.slice(0, 10);
  }

  // 🔹 Limpiar selects y radios
  servicioSelect.value = '';
  document.querySelectorAll('input[name="profesional"]').forEach(r => r.checked = false);

  // 🔹 Volver a ocultar los profesionales
  filtrarProfesionales();

  // 🔹 Limpiar mensajes de error (ejemplo: error_hora)
  errorHora.textContent = '';
})

    .catch(err => {
      console.error('Error:', err);
      alert('Hubo un problema al guardar la reserva');
    });
  });
});
