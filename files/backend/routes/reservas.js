// backend/routes/reservas.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/* GET /api/reservas
   - Admin: ve todas
   - Usuario: ve sólo las suyas */
router.get('/', async (req, res) => {
  const sesion = req.usuario || null;

  let sql = 'SELECT * FROM reservas';
  let params = [];

  if (sesion && sesion.rol !== 'admin') {
    sql += ' WHERE usuario_id = ? OR email = ?';
    params = [sesion.id || 0, sesion.email || ''];
  }

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener reservas:', err);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

/* DELETE /api/reservas/:id */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const sesion = req.usuario || null;

  try {
    if (sesion && sesion.rol === 'admin') {
      const [result] = await pool.query('DELETE FROM reservas WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      return res.json({ message: 'Reserva eliminada' });
    }

    if (sesion && sesion.id) {
      const [result] = await pool.query(
        'DELETE FROM reservas WHERE id = ? AND usuario_id = ?',
        [id, sesion.id]
      );
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: 'No autorizado o reserva no encontrada' });
      }
      return res.json({ message: 'Reserva eliminada' });
    }

    res.status(401).json({ message: 'No autenticado' });
  } catch (err) {
    console.error('❌ Error al eliminar reserva:', err);
    res.status(500).json({ message: 'Error al eliminar reserva' });
  }
});

/* POST /api/reservas */
router.post('/', async (req, res) => {
  const sesion = req.usuario || {};
  const {
    usuario_id      = sesion.id      || null,
    nombre          = sesion.nombre  || '',
    email           = sesion.email   || '',
    telefono        = sesion.telefono|| '',
    fecha_nacimiento= sesion.fecha_nacimiento || '',
    fecha, hora, servicio, profesional, observaciones = ''
  } = req.body;

  if (!nombre || !email || !telefono || !fecha_nacimiento ||
      !fecha || !hora || !servicio || !profesional) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const sql = `
      INSERT INTO reservas
      (usuario_id, nombre, email, telefono, fecha_nacimiento,
       fecha, hora, servicio, profesional, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      usuario_id, nombre, email, telefono, fecha_nacimiento,
      fecha, hora, servicio, profesional, observaciones
    ]);

    res.json({ message: 'Reserva registrada correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar la reserva:', err);
    res.status(500).json({ message: 'Error al guardar la reserva' });
  }
});

/* GET /api/reservas/profesional */
router.get('/profesional', async (req, res) => {
  const sesion = req.usuario || null;
  if (!sesion) return res.status(401).json({ message: 'No autenticado' });

  const esStaff = ['barbero', 'tatuador', 'admin'].includes(sesion.rol);
  if (!esStaff) return res.status(403).json({ message: 'No autorizado' });

  const profesional = (req.query.profesional || sesion.nombre || '').trim();
  if (!profesional) {
    return res.status(400).json({ message: 'No se pudo determinar el profesional' });
  }

  try {
    const sql = `
      SELECT id, fecha, hora, servicio, profesional, observaciones, nombre
      FROM reservas
      WHERE LOWER(TRIM(profesional)) = LOWER(TRIM(?))
      ORDER BY fecha, hora
    `;
    const [rows] = await pool.query(sql, [profesional]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener reservas del profesional:', err);
    res.status(500).json({ message: 'Error al obtener reservas del profesional' });
  }
});

module.exports = router;
