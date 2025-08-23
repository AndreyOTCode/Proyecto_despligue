// backend/routes/sesiones.js
const sesionesActivas = {};

function crearSesion(usuario) {
  const sessionId = Date.now().toString() + Math.random().toString(36).substring(2);
  sesionesActivas[sessionId] = usuario;
  return sessionId;
}

function cerrarSesion(sessionId) {
  delete sesionesActivas[sessionId];
}

module.exports = { sesionesActivas, crearSesion, cerrarSesion };
