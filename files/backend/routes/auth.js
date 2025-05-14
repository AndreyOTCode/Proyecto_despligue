// backend/auth.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567890',
  database: 'ragnarok_db'
});

db.connect(err => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Ruta de registro
router.post('/registro', async (req, res) => {
  const { nombre, telefono, email, contrasena } = req.body;

  if (!nombre || !telefono || !email || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en el servidor' });
    if (results.length > 0) return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    db.query(
      'INSERT INTO usuarios (nombre, telefono, email, contrasena) VALUES (?, ?, ?, ?)',
      [nombre, telefono, email, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error al registrar el usuario' });
        res.status(200).json({ message: 'Usuario registrado correctamente' });
      }
    );
  });
});

// Ruta de login
router.post('/login', (req, res) => {
  const { email, contrasena } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ message: 'Correo no registrado' });

    const usuario = results[0];

    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: usuario.nombre });
  });
});

module.exports = router;
