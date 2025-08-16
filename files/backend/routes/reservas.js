//backend/routes/reservas.js
const express = require('express');
const router  = express.Router();
const { connection } = require('../db');

/* GET /api/reservas
   - Admin: ve todas
   - Usuario: ve sólo las suyas (por usuario_id o por email de la sesión) */
router.get('/', (req, res) => {
  const sesion = req.session.usuario || null;

  let sql = 'SELECT * FROM reservas';
  let params = [];

  if (sesion && sesion.rol !== 'admin') {
    sql += ' WHERE usuario_id = ? OR email = ?';
    params = [sesion.id || 0, sesion.email || ''];
  }

  connection.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).json({ message: 'Error al obtener reservas' });
    }
    res.json(rows);
  });
});

/* DELETE /api/reservas/:id
   - Admin: puede borrar cualquiera
   - Usuario: sólo borra citas suyas (por usuario_id) */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sesion = req.session.usuario || null;

  if (sesion && sesion.rol === 'admin') {
    connection.query('DELETE FROM reservas WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error al eliminar reserva:', err);
        return res.status(500).json({ message: 'Error al eliminar reserva' });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
      res.json({ message: 'Reserva eliminada' });
    });
    return;
  }

  if (sesion && sesion.id) {
    connection.query('DELETE FROM reservas WHERE id = ? AND usuario_id = ?', [id, sesion.id], (err, result) => {
      if (err) {
        console.error('Error al eliminar reserva:', err);
        return res.status(500).json({ message: 'Error al eliminar reserva' });
      }
      if (result.affectedRows === 0) return res.status(403).json({ message: 'No autorizado o reserva no encontrada' });
      res.json({ message: 'Reserva eliminada' });
    });
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

/* POST (tu ruta existente, no la toco) */
router.post('/', (req, res) => {
  const sesion = req.session.usuario || {};
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

  const sql = `
      INSERT INTO reservas
      (usuario_id, nombre, email, telefono, fecha_nacimiento,
       fecha, hora, servicio, profesional, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [usuario_id, nombre, email, telefono, fecha_nacimiento,
     fecha, hora, servicio, profesional, observaciones],
    err => {
      if (err) {
        console.error('Error al guardar la reserva:', err);
        return res.status(500).json({ message: 'Error al guardar la reserva' });
      }
      res.json({ message: 'Reserva registrada correctamente' });
    }
  );
});

// GET /api/reservas/profesional
// - barbero/tatuador: ve SOLO sus citas (coincidencia por "profesional")
// - admin: puede filtrar pasando ?profesional=Nombre
router.get('/profesional', (req, res) => {
  const sesion = req.session.usuario || null;
  if (!sesion) return res.status(401).json({ message: 'No autenticado' });

  const esStaff = ['barbero', 'tatuador', 'admin'].includes(sesion.rol);
  if (!esStaff) return res.status(403).json({ message: 'No autorizado' });

  // Si no viene query, usamos el nombre en sesión (barbero/tatuador)
  const profesional = (req.query.profesional || sesion.nombre || '').trim();
  if (!profesional) {
    return res.status(400).json({ message: 'No se pudo determinar el profesional' });
  }

const sql = `
  SELECT id, fecha, hora, servicio, profesional, observaciones, nombre
  FROM reservas
  WHERE LOWER(TRIM(profesional)) = LOWER(TRIM(?))
  ORDER BY fecha, hora
`;


  connection.query(sql, [profesional], (err, rows) => {
    if (err) {
      console.error('Error al obtener reservas del profesional:', err);
      return res.status(500).json({ message: 'Error al obtener reservas del profesional' });
    }
    res.json(rows);
  });
});


module.exports = router;
