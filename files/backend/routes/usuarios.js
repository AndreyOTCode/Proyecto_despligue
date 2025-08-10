// backend/routes/usuarios.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { pool } = require('../db');

console.log('✅ Archivo de rutas /usuarios.js cargado');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, telefono, email, fecha_nacimiento, rol FROM usuarios'
    );
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, fecha_nacimiento, rol, contrasena } = req.body;

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, telefono, fecha_nacimiento, rol, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono, fecha_nacimiento, rol, hashedPassword]
    );

    res.json({ id: resultado.insertId });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, email, telefono, fecha_nacimiento, rol, contrasena } = req.body;

    // Si envían contraseña, encriptar
    if (contrasena && contrasena.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      contrasena = await bcrypt.hash(contrasena, salt);
    } else {
      // Mantener la contraseña actual si no se envía una nueva
      const [rows] = await pool.query('SELECT contrasena FROM usuarios WHERE id = ?', [id]);
      contrasena = rows[0].contrasena;
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, fecha_nacimiento = ?, rol = ?, contrasena = ? WHERE id = ?',
      [nombre, email, telefono, fecha_nacimiento, rol, contrasena, id]
    );

    res.json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
