const express = require('express');
const router = express.Router();
const {connection} = require('../db');

// Obtener todos los productos (esto ya lo tienes bien)
router.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error interno' });
    }
    res.json(results);
  });
});

// ✅ Ruta para descontar stock después de una compra
router.post('/descontar-stock', (req, res) => {
  const productos = req.body.productos;

  if (!productos || !Array.isArray(productos)) {
    return res.status(400).json({ message: 'Formato inválido' });
  }

  const sql = 'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?';
  let fallos = [];

  const updates = productos.map(p => {
    return new Promise((resolve, reject) => {
      connection.query(sql, [p.cantidad, p.id, p.cantidad], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) fallos.push(p.id);
        resolve();
      });
    });
  });

  Promise.all(updates)
    .then(() => {
      if (fallos.length > 0) {
        return res.status(409).json({ message: 'Fallo de stock en algunos productos', fallos });
      }
      res.json({ message: 'Stock actualizado correctamente' });
    })
    .catch(err => {
      console.error('Error al actualizar stock:', err);
      res.status(500).json({ message: 'Error interno al actualizar stock' });
    });
});

router.post('/registrar-venta', (req, res) => {
  const { usuario_id, productos } = req.body;

  if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  const totalVenta = productos.reduce((acc, p) => acc + (p.precio_unitario * p.cantidad), 0);

  // Insertar en tabla ventas
  const sqlVenta = 'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)';
  connection.query(sqlVenta, [usuario_id, totalVenta], (err, ventaResult) => {
    if (err) {
      console.error('Error al registrar venta:', err);
      return res.status(500).json({ message: 'Error al registrar venta' });
    }

    const ventaId = ventaResult.insertId;

    // Insertar detalle de venta
    const sqlDetalle = 'INSERT INTO venta_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES ?';
    const detalles = productos.map(p => [ventaId, p.id, p.cantidad, p.precio_unitario]);

    connection.query(sqlDetalle, [detalles], (err2) => {
      if (err2) {
        console.error('Error al registrar detalle de venta:', err2);
        return res.status(500).json({ message: 'Error en detalle de venta' });
      }

      res.json({ message: 'Venta registrada con éxito' });
    });
  });
});


module.exports = router;
