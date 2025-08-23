// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { setupDatabase } = require('./db'); 
setupDatabase();

const authRoutes = require('./routes/auth');
const reservasRoutes = require('./routes/reservas');
const loginRoutes = require('./routes/login');
const usuarioRoutes = require('./routes/usuario');
const logoutRoutes = require('./routes/logout'); 
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const disponibilidadRoutes = require('./routes/disponibilidad');
const adminRoutes = require('./routes/admin');
const usuarios = require('./routes/usuarios');
const inventariosRoutes = require('./routes/inventarios');
const { autenticacion } = require('./routes/autenticacion');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["https://ragnarokapp.netlify.app"],
  credentials: true              
}));
app.use(bodyParser.json());

// 📌 Carpeta pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔍 Middleware de autenticación (inserta req.usuario si hay sessionId válido)
app.use(autenticacion);

// 📌 Rutas
app.use('/api', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/login', loginRoutes);
app.use('/api', logoutRoutes);   
app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', usuarios);
app.use('/api', usuarioRoutes);
app.use('/api/inventarios', inventariosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
