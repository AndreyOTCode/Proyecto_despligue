// backend/routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { crearSesion } = require('../routes/sesiones');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const [results] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!results.length) return res.status(401).json({ message: 'Correo no registrado' });

    const usuario = results[0];
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const usuarioData = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      fecha_nacimiento: usuario.fecha_nacimiento,
      rol: usuario.rol
    };

    const sessionId = crearSesion(usuarioData);

    res.json({
      message: 'Inicio de sesión exitoso',
      usuario: usuarioData,
      sessionId
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;

