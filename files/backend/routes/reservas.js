// backend/routes/reservas.js
const express = require('express');
const router  = express.Router();
const {connection} = require('../db');

/*  POST /api/reservas
    Crea una reserva; si el usuario está en sesión no hace falta enviar su info.      */
router.post('/', (req, res) => {
  // Si el usuario está autenticado, tomamos sus datos de la sesión
  const sesion = req.session.usuario || {};

  // Datos que llegan del frontend
  const {
    usuario_id      = sesion.id      || null,
    nombre          = sesion.nombre  || '',
    email           = sesion.email   || '',
    telefono        = sesion.telefono|| '',
    fecha_nacimiento= sesion.fecha_nacimiento || '',
    fecha, hora, servicio, profesional, observaciones = ''
  } = req.body;

  // Validación mínima
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
    [
      usuario_id, nombre, email, telefono, fecha_nacimiento,
      fecha, hora, servicio, profesional, observaciones
    ],
    err => {
      if (err) {
        console.error('Error al guardar la reserva:', err);
        return res.status(500).json({ message: 'Error al guardar la reserva' });
      }
      res.json({ message: 'Reserva registrada correctamente' });
    }
  );
});

module.exports = router;
