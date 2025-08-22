// backend/routes/ventas.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // conexión con promesas

// 📊 Reporte de ventas
router.get('/reporte-ventas', async (req, res) => {
  const { inicio, fin } = req.query;

  let sql = `
    SELECT v.id AS venta_id, v.fecha, u.nombre AS cliente, 
           p.nombre AS producto, vd.cantidad, vd.precio_unitario,
           (vd.cantidad * vd.precio_unitario) AS total
    FROM ventas v
    JOIN usuarios u ON v.usuario_id = u.id
    JOIN venta_detalle vd ON v.id = vd.venta_id
    JOIN productos p ON vd.producto_id = p.id
  `;

  const params = [];

  if (inicio && fin) {
    sql += ` WHERE DATE(v.fecha) BETWEEN ? AND ? `;
    params.push(inicio, fin);
  }

  sql += ` ORDER BY v.fecha DESC`;

  try {
    console.log('📥 Ruta /api/reporte-ventas llamada con:', req.query);
    const [results] = await pool.query(sql, params); // 🔹 Usamos promesas
    return res.json(results);
  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    return res.status(500).json({ error: 'Error al obtener reporte de ventas' });
  }
});

module.exports = router;
