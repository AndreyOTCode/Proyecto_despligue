// backend/routes/logout.js
const express = require('express');
const router  = express.Router();

/*  POST /api/logout
    Destruye la sesión y borra la cookie connect.sid
---------------------------------------------------- */
router.post('/logout', (req, res) => {
  // Si no hay sesión no pasa nada; respondemos OK igualmente
  if (!req.session) {
    return res.json({ message: 'Sesión cerrada (no existía)' });
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }

    // Borra la cookie en el navegador
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada correctamente' });
  });
});

module.exports = router;
