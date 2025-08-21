const express = require('express');
const router = express.Router();
const { pool} = require('../db');

// POST /api/disponibilidad - Registrar disponibilidad
router.post('/', (req, res) => {
  const { fecha, hora_inicio, hora_fin } = req.body;
  const usuario = req.session.usuario;

  if (!usuario || (usuario.rol !== 'barbero' && usuario.rol !== 'tatuador')) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  if (!fecha || !hora_inicio || !hora_fin || hora_inicio >= hora_fin) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  const sql = `
    INSERT INTO disponibilidad (artista_id, fecha, hora_inicio, hora_fin)
    VALUES (?, ?, ?, ?)
  `;

  pool.query(sql, [usuario.id, fecha, hora_inicio, hora_fin], (err) => {
    if (err) {
      console.error('Error guardando disponibilidad:', err);
      return res.status(500).json({ message: 'Error al guardar disponibilidad' });
    }

    res.json({ message: 'Disponibilidad registrada correctamente' });
  });
});


// GET /api/disponibilidad - Consultar disponibilidad del artista
router.get('/', (req, res) => {
  const usuario = req.session.usuario;

  if (!usuario || (usuario.rol !== 'barbero' && usuario.rol !== 'tatuador')) {
    return res.status(403).json({ message: 'No autorizado' });
  }

const sql = `
  SELECT fecha, hora_inicio, hora_fin 
  FROM disponibilidad 
  WHERE artista_id = ? 
  ORDER BY fecha, hora_inicio
`;
  pool.query(sql, [usuario.id], (err, results) => {
    if (err) {
      console.error('Error obteniendo disponibilidad:', err);
      return res.status(500).json({ message: 'Error al consultar disponibilidad' });
    }

    res.json(results);
  });
});

module.exports = router;
