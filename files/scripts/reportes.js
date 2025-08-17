document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tabla-ventas');
  const btnFiltrar = document.getElementById('btn-filtrar');

  function cargarVentas(inicio = '', fin = '') {
    let url = 'http://localhost:3000/api/reporte-ventas';
    if (inicio && fin) {
      url += `?inicio=${inicio}&fin=${fin}`;
    }

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          tabla.innerHTML = '<tr><td colspan="7" class="text-center">No hay ventas registradas.</td></tr>';
          return;
        }

        tabla.innerHTML = '';
        data.forEach(venta => {
          tabla.innerHTML += `
            <tr>
              <td>${venta.venta_id}</td>
              <td>${new Date(venta.fecha).toLocaleString()}</td>
              <td>${venta.cliente}</td>
              <td>${venta.producto}</td>
              <td>${venta.cantidad}</td>
              <td>$${venta.precio_unitario.toLocaleString()}</td>
              <td>$${venta.total.toLocaleString()}</td>
            </tr>
          `;
        });
      })
      .catch(err => {
        console.error(err);
        tabla.innerHTML = '<tr><td colspan="7" class="text-danger text-center">Error al cargar ventas.</td></tr>';
      });
  }

  btnFiltrar.addEventListener('click', () => {
    const inicio = document.getElementById('filtro-fecha-inicio').value;
    const fin = document.getElementById('filtro-fecha-fin').value;
    cargarVentas(inicio, fin);
  });

  cargarVentas(); // al cargar la página
});
