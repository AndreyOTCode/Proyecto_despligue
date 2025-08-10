// frontend/scripts/usuarios.js
document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:3000/api/usuarios';

  const tablaUsuarios = document.getElementById('tabla-usuarios');
  const formulario = document.getElementById('form-usuario');
  const btnGuardar = formulario.querySelector('button[type="submit"]');
  const idUsuarioInput = document.getElementById('usuario-id');

  // 📌 Ahora es async
  async function cargarUsuarios() {
  try {
    console.log('📡 Solicitando usuarios a:', BASE_URL);

    const res = await fetch(BASE_URL, {
      credentials: 'include'
    });

    console.log('📥 Respuesta completa:', res);

    if (!res.ok) {
      console.error('❌ Error HTTP:', res.status, res.statusText);
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const texto = await res.text(); // obtenemos texto crudo
    console.log('📄 Respuesta en texto:', texto);

    let usuarios;
    try {
      usuarios = JSON.parse(texto); // intentamos parsear a JSON
    } catch (parseErr) {
      console.error('⚠️ Error al convertir a JSON:', parseErr);
      throw new Error('La respuesta no es JSON válido');
    }

    tablaUsuarios.innerHTML = '';
    usuarios.forEach(usuario => {
      tablaUsuarios.innerHTML += `
        <tr>
          <td>${usuario.id}</td>
          <td>${usuario.nombre}</td>
          <td>${usuario.email}</td>
          <td>${usuario.telefono}</td>
          <td>${usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : ''}</td>
          <td>${usuario.rol}</td>
          <td>
            <button class="btn btn-sm btn-warning m-2" onclick='editarUsuario(${JSON.stringify(usuario)})'>✏️</button>
            </br>
            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})">🗑️</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error('🔥 Error en cargarUsuarios:', err);
    alert('No se pudieron cargar los usuarios.');
  }
}

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = idUsuarioInput.value;
    const nombre = formulario.nombre.value;
    const email = formulario.email.value;
    const telefono = formulario.telefono.value;
    const fecha_nacimiento = formulario.fecha_nacimiento.value;
    const rol = formulario.rol.value;
    const contrasena = formulario.contrasena.value;

    const datos = { nombre, email, telefono, fecha_nacimiento, rol, contrasena };

    const url = id ? `${BASE_URL}/${id}` : BASE_URL;
    const metodo = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      formulario.reset();
      idUsuarioInput.value = '';
      btnGuardar.textContent = 'Guardar';
      cargarUsuarios();
    } else {
      alert('Error al guardar el usuario');
    }
  });

  window.editarUsuario = (usuario) => {
    formulario.nombre.value = usuario.nombre;
    formulario.email.value = usuario.email;
    formulario.telefono.value = usuario.telefono;
    formulario.fecha_nacimiento.value = usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : '';
    formulario.rol.value = usuario.rol;
    idUsuarioInput.value = usuario.id;
    btnGuardar.textContent = 'Actualizar';
  };

  window.eliminarUsuario = async (id) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) cargarUsuarios();
      else alert('Error al eliminar el usuario');
    }
  };

  cargarUsuarios();
});
