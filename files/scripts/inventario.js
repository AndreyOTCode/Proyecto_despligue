//frontend/scripts/innventario.js

document.addEventListener('DOMContentLoaded', () => {
const BASE_URL = 'http://localhost:3000/api/inventarios';


  const tablaProductos = document.getElementById('tabla-productos');
  const formulario = document.getElementById('form-producto');
  const btnGuardar = formulario.querySelector('button[type="submit"]');
  const idProductoInput = document.getElementById('producto-id');

  async function cargarProductos() {
    try {
      const res = await fetch(BASE_URL, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const productos = await res.json();

      tablaProductos.innerHTML = '';
      productos.forEach(p => {
        tablaProductos.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.descripcion || ''}</td>
            <td><img src="${p.imagen_url || ''}" alt="" style="width:50px;height:50px;object-fit:cover"></td>
            <td>$${p.precio}</td>
            <td>${p.stock}</td>
            <td>${p.categoria}</td>
            <td>
              <button class="btn btn-sm btn-warning m-1" onclick='editarProducto(${JSON.stringify(p)})'>✏️</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">🗑️</button>
            </td>
          </tr>
        `;
      });
    } catch (err) {
      console.error(err);
      alert('Error al cargar productos');
    }
  }

  formulario.addEventListener('submit', async e => {
    e.preventDefault();

    const id = idProductoInput.value;
    const producto = {
      nombre: formulario.nombre.value,
      descripcion: formulario.descripcion.value,
      imagen_url: formulario.imagen_url.value,
      precio: formulario.precio.value,
      stock: formulario.stock.value,
      categoria: formulario.categoria.value
    };

    const url = id ? `${BASE_URL}/${id}` : BASE_URL;
    const metodo = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(producto)
    });

    if (res.ok) {
      formulario.reset();
      idProductoInput.value = '';
      btnGuardar.textContent = 'Guardar';
      cargarProductos();
    } else {
      alert('Error al guardar producto');
    }
  });

  window.editarProducto = (p) => {
    formulario.nombre.value = p.nombre;
    formulario.descripcion.value = p.descripcion;
    formulario.imagen_url.value = p.imagen_url;
    formulario.precio.value = p.precio;
    formulario.stock.value = p.stock;
    formulario.categoria.value = p.categoria;
    idProductoInput.value = p.id;
    btnGuardar.textContent = 'Actualizar';
  };

  window.eliminarProducto = async (id) => {
    if (confirm('¿Eliminar producto?')) {
      const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) cargarProductos();
      else alert('Error al eliminar producto');
    }
  };

  cargarProductos();
});
