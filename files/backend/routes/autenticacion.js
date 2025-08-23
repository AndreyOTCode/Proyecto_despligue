// backend/routes/autenticacion.js
const { sesionesActivas } = require('./sesiones');

function autenticacion(req, res, next) {
  const sessionId = req.headers['x-session-id'] || 
                    (req.headers['authorization']?.split(' ')[1]);

  if (sessionId && sesionesActivas[sessionId]) {
    req.usuario = sesionesActivas[sessionId]; // inyectamos usuario
  } else {
    req.usuario = null;
  }

  next();
}

module.exports = { autenticacion };
