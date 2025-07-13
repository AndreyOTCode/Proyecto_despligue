// backend/usuario.js
const express = require('express');
const router = express.Router();

router.get('/usuario-sesion', (req, res) => {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const usuario = req.session.usuario;

  res.json({
    message: 'Sesión activa',
    usuario,
    rol: usuario.rol
  });
});

module.exports = router;