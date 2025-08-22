// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

// Ruta POST /api/registro
router.post('/registro', async (req, res) => {
  const { nombre, telefono, email, fecha_nacimiento, contrasena } = req.body;
  const rol = 'cliente';

  // Validación rápida de campos requeridos
  if (!nombre || !telefono || !email || !fecha_nacimiento || !contrasena || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el correo ya está registrado
    const [results] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (results.length > 0) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar nuevo usuario
    const insertarUsuario = `
      INSERT INTO usuarios (nombre, telefono, email, fecha_nacimiento, contrasena, rol)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.query(insertarUsuario, [nombre, telefono, email, fecha_nacimiento, hash, rol]);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

module.exports = router;
