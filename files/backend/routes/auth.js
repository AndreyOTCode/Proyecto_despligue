// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('../db'); // Ajusta si el archivo no se llama exactamente db.js

const router = express.Router();

// Ruta POST /api/registro
router.post('/registro', (req, res) => {
  const { nombre, telefono, email, fecha_nacimiento, contrasena, rol } = req.body;

  // Validación rápida de campos requeridos
  if (!nombre || !telefono || !email || !fecha_nacimiento || !contrasena || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Verificar si el correo ya está registrado
  const verificarEmail = 'SELECT id FROM usuarios WHERE email = ?';
  connection.query(verificarEmail, [email], async (err, results) => {
    if (err) {
      console.error('❌ Error al verificar correo:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    try {
      // Encriptar contraseña
      const hash = await bcrypt.hash(contrasena, 10);

      // Insertar nuevo usuario
      const insertarUsuario = `
        INSERT INTO usuarios (nombre, telefono, email, fecha_nacimiento, contrasena, rol)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      connection.query(
        insertarUsuario,
        [nombre, telefono, email, fecha_nacimiento, hash, rol],
        (err, result) => {
          if (err) {
            console.error('❌ Error al registrar usuario:', err);
            return res.status(500).json({ message: 'Error al registrar el usuario' });
          }

          res.status(201).json({ message: 'Usuario registrado exitosamente' });
        }
      );
    } catch (error) {
      console.error('❌ Error al encriptar la contraseña:', error);
      res.status(500).json({ message: 'Error al procesar la contraseña' });
    }
  });
});

module.exports = router;
