// backend/routes/inventarios.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Obtener productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos'); // <-- tabla sigue igual
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, imagen_url, precio, stock, categoria } = req.body;
    const [resultado] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, imagen_url, precio, stock, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, imagen_url, precio, stock, categoria]
    );
    res.json({ id: resultado.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen_url, precio, stock, categoria } = req.body;
    await pool.query(
      'UPDATE productos SET nombre=?, descripcion=?, imagen_url=?, precio=?, stock=?, categoria=? WHERE id=?',
      [nombre, descripcion, imagen_url, precio, stock, categoria, id]
    );
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id=?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
