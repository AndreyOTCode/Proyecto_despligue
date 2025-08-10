// routes/admin.js
const express = require('express');
const {connection} = require('../db');
const router = express.Router();

// Middleware para verificar si es admin
function esAdmin(req, res, next) {
  if (!req.session?.usuario || req.session.usuario.rol !== 'admin') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Obtener todos los usuarios
router.get('/usuarios', esAdmin, (req, res) => {
  connection.query('SELECT id, nombre, email, rol FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Editar rol
router.put('/usuarios/:id/rol', esAdmin, (req, res) => {
  const { id } = req.params;
  const { nuevoRol } = req.body;
  const rolesPermitidos = ['admin', 'barbero', 'tatuador', 'cliente'];

  if (!rolesPermitidos.includes(nuevoRol)) {
    return res.status(400).json({ message: 'Rol no permitido' });
  }

  connection.query(
    'UPDATE usuarios SET rol = ? WHERE id = ?',
    [nuevoRol, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al actualizar el rol' });
      res.json({ message: 'Rol actualizado exitosamente' });
    }
  );
});

module.exports = router;
 