// frontend/scripts/citas.js
document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'https://proyecto-despligue.onrender.com/api/reservas';
  const tablaCitas = document.getElementById('tabla-citas');

  async function cargarCitas() {
    try {
      const res = await fetch(BASE_URL, {headers: { 'x-session-id': sessionId }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const texto = await res.text();
      let citas;
      try {
        citas = JSON.parse(texto);
      } catch {
        throw new Error('La respuesta no es JSON válido');
      }

      tablaCitas.innerHTML = '';
      if (!Array.isArray(citas) || citas.length === 0) {
        tablaCitas.innerHTML = `<tr><td colspan="7">No hay citas registradas</td></tr>`;
        return;
      }

      citas.forEach(cita => {
        tablaCitas.innerHTML += `
          <tr>
            <td>${cita.id}</td>
            <td>${cita.fecha ? cita.fecha.split('T')[0] : ''}</td>
            <td>${cita.hora || ''}</td>
            <td>${cita.servicio || ''}</td>
            <td>${cita.profesional || ''}</td>
            <td>${cita.observaciones || ''}</td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="eliminarCita(${cita.id})">🗑️</button>
            </td>
          </tr>
        `;
      });
    } catch (e) {
      console.error('🔥 Error en cargarCitas:', e);
      tablaCitas.innerHTML = `<tr><td colspan="7">Error al cargar las citas</td></tr>`;
    }
  }

  window.eliminarCita = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'x-session-id': sessionId }
        });
        if (res.ok) {
          cargarCitas();
        } else {
          alert('Error al eliminar la cita');
        }
      } catch (e) {
        console.error('🔥 Error al eliminar cita:', e);
      }
    }
  };

  cargarCitas();
});
