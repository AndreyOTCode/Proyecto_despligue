// backend/server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const reservasRoutes = require('./routes/reservas');
const loginRoutes = require('./routes/login');
const usuarioRoutes = require('./routes/usuario');
const logoutRoutes = require('./routes/logout'); 
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');



const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:5500','http://127.0.0.1:5500'],
  credentials: true              
}));
app.use(bodyParser.json());

app.use(session({
  secret: 'tu_secreto_seguro', // Cámbialo por una clave fuerte y privada
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
      sameSite: 'lax', // Sesión válida por 2 horas (ajustable)
      secure: false  
    }
}));

//  🔍 Logger de cookies y sesión
app.use((req, res, next) => {
  console.log('➡️  Petición:', req.method, req.originalUrl);
  console.log('   Cookies recibidas:', req.headers.cookie || '— ninguna —');
  console.log('   req.session.id:', req.session.id);
  console.log('   req.session.usuario:', req.session.usuario);
  next();
});


app.use('/api', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/login', loginRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', logoutRoutes);   
app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);





app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
