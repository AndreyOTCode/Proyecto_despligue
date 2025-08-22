// routes/admin.js
const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Middleware para verificar si es admin
function esAdmin(req, res, next) {
  if (!req.session?.usuario || req.session.usuario.rol !== 'admin') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Obtener todos los usuarios
router.get('/usuarios', esAdmin, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
    res.json(results);
  } catch (err) {
    console.error('❌ Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Editar rol
router.put('/usuarios/:id/rol', esAdmin, async (req, res) => {
  const { id } = req.params;
  const { nuevoRol } = req.body;
  const rolesPermitidos = ['admin', 'barbero', 'tatuador', 'cliente'];

  if (!rolesPermitidos.includes(nuevoRol)) {
    return res.status(400).json({ message: 'Rol no permitido' });
  }

  try {
    await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', [nuevoRol, id]);
    res.json({ message: 'Rol actualizado exitosamente' });
  } catch (err) {
    console.error('❌ Error al actualizar el rol:', err);
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
});

module.exports = router;
