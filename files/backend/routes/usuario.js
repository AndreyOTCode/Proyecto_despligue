  // backend/usuario.js
  const express = require('express');
  const router = express.Router();

  router.get('/usuario-sesion', (req, res) => {
  if (!req.usuario) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  res.json({
    message: 'Sesión activa',
    usuario: req.usuario,
    rol: req.usuario.rol
  });
});


  module.exports = router;