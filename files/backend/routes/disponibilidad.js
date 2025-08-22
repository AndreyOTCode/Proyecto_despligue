// routes/disponibilidad.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/disponibilidad - Registrar disponibilidad
router.post('/', async (req, res) => {
  const { fecha, hora_inicio, hora_fin } = req.body;
  const usuario = req.session.usuario;

  if (!usuario || (usuario.rol !== 'barbero' && usuario.rol !== 'tatuador')) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  if (!fecha || !hora_inicio || !hora_fin || hora_inicio >= hora_fin) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  try {
    const sql = `
      INSERT INTO disponibilidad (artista_id, fecha, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(sql, [usuario.id, fecha, hora_inicio, hora_fin]);
    res.json({ message: 'Disponibilidad registrada correctamente' });
  } catch (err) {
    console.error('❌ Error guardando disponibilidad:', err);
    res.status(500).json({ message: 'Error al guardar disponibilidad' });
  }
});

// GET /api/disponibilidad - Consultar disponibilidad del artista
router.get('/', async (req, res) => {
  const usuario = req.session.usuario;

  if (!usuario || (usuario.rol !== 'barbero' && usuario.rol !== 'tatuador')) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  try {
    const sql = `
      SELECT fecha, hora_inicio, hora_fin 
      FROM disponibilidad 
      WHERE artista_id = ? 
      ORDER BY fecha, hora_inicio
    `;
    const [results] = await pool.query(sql, [usuario.id]);
    res.json(results);
  } catch (err) {
    console.error('❌ Error obteniendo disponibilidad:', err);
    res.status(500).json({ message: 'Error al consultar disponibilidad' });
  }
});

module.exports = router;
