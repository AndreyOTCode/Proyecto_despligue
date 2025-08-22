// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // mantenemos tu export actual

// GET /api/productos  -> lista todos los productos
router.get('/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    return res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
    return res.status(500).json({ error: 'Error interno al obtener productos' });
  }
});

// POST /api/descontar-stock  -> descuenta stock de múltiples productos
router.post('/descontar-stock', async (req, res) => {
  try {
    const productos = req.body.productos;

    if (!productos || !Array.isArray(productos)) {
      return res.status(400).json({ message: 'Formato inválido' });
    }

    const sql = 'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?';
    const fallos = [];

    // Ejecutamos todas las actualizaciones en paralelo
    await Promise.all(
      productos.map(async (p) => {
        const [result] = await pool.query(sql, [p.cantidad, p.id, p.cantidad]);
        if (result.affectedRows === 0) {
          fallos.push(p.id); // no actualizó (stock insuficiente o id inexistente)
        }
      })
    );

    if (fallos.length > 0) {
      return res.status(409).json({ message: 'Fallo de stock en algunos productos', fallos });
    }

    return res.json({ message: 'Stock actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar stock:', err);
    return res.status(500).json({ message: 'Error interno al actualizar stock' });
  }
});

// POST /api/registrar-venta  -> registra venta y detalle
router.post('/registrar-venta', async (req, res) => {
  try {
    const { usuario_id, productos } = req.body;

    if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const totalVenta = productos.reduce((acc, p) => acc + (p.precio_unitario * p.cantidad), 0);

    // Insert venta
    const sqlVenta = 'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)';
    const [ventaResult] = await pool.query(sqlVenta, [usuario_id, totalVenta]);
    const ventaId = ventaResult.insertId;

    // Insert detalle de venta (bulk insert)
    const sqlDetalle = 'INSERT INTO venta_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES ?';
    const detalles = productos.map(p => [ventaId, p.id, p.cantidad, p.precio_unitario]);

    await pool.query(sqlDetalle, [detalles]);

    return res.json({ message: 'Venta registrada con éxito', venta_id: ventaId });
  } catch (err) {
    console.error('❌ Error al registrar venta:', err);
    return res.status(500).json({ message: 'Error al registrar venta' });
  }
});

module.exports = router;
