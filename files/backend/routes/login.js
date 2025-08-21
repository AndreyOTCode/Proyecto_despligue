// backend/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool} = require('../db');

const router = express.Router();

// Ruta de login
router.post('/', (req, res) => {
  const { email, contrasena } = req.body;

  pool.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Error en el servidor' });
      if (!results.length) return res.status(401).json({ message: 'Correo no registrado' });

      const usuario = results[0];
      const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

      // --- Guardamos la sesión ---
      req.session.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento,
        rol: usuario.rol
      };

      // IMPORTANTE: Asegurar que la sesión se guarda antes de responder
      req.session.save(err => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
          return res.status(500).json({ message: 'No se pudo guardar la sesión' });
        }

        res.json({
          message: 'Inicio de sesión exitoso',
          usuario: req.session.usuario
        });
      });
    }
  );
});

module.exports = router;
