// backend/routes/logout.js
const express = require('express');
const { cerrarSesion } = require('../routes/sesiones');
const router  = express.Router();

router.post('/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 
                    (req.headers['authorization']?.split(' ')[1]);

  if (sessionId) cerrarSesion(sessionId);

  res.json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;
