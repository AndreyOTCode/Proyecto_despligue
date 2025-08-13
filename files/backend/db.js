//backend/db.js
require('dotenv').config();
const mysql = require('mysql2');

// Conexión normal para las partes antiguas (login, etc.)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Pool de promesas para consultas con async/await
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).promise();

async function setupDatabase() {
  try {
    // Conexión temporal en modo promesa
    const mysqlPromise = require('mysql2/promise');
    const tempConn = await mysqlPromise.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS ragnarok_db`);
    console.log("✅ Base de datos 'ragnarok_db' lista");

    await tempConn.changeUser({ database: 'ragnarok_db' });

    const tables = [
      `CREATE TABLE IF NOT EXISTS disponibilidad (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        artista_id INT NOT NULL,
        fecha DATE NOT NULL,
        estado ENUM('disponible','no_disponible') DEFAULT 'disponible',
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS productos (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(255),
        precio DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        categoria ENUM('barberia','tatuajes') NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS reservas (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        fecha DATE,
        hora TIME,
        servicio VARCHAR(50),
        profesional VARCHAR(100),
        observaciones TEXT,
        fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        nombre VARCHAR(100),
        email VARCHAR(100),
        telefono VARCHAR(20),
        fecha_nacimiento DATE
      )`,

      `CREATE TABLE IF NOT EXISTS usuarios (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        telefono VARCHAR(20),
        email VARCHAR(100) UNIQUE,
        fecha_nacimiento DATE,
        contrasena VARCHAR(255),
        rol ENUM('admin','barbero','tatuador','cliente') DEFAULT 'cliente',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS venta_detalle (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        venta_id INT,
        producto_id INT,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS ventas (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10,2)
      )`
    ];

    for (const table of tables) {
      await tempConn.query(table);
    }

    console.log("✅ Tablas listas en 'ragnarok_db'");
    await tempConn.end();
  } catch (error) {
    console.error("❌ Error creando base de datos o tablas:", error);
  }
}


module.exports = { connection, pool, setupDatabase };
