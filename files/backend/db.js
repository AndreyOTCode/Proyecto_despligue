// db.js
const mysql = require('mysql2');

// Conexión normal para las partes antiguas (login, etc.)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567890',
  database: 'ragnarok_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Pool de promesas para consultas con async/await
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234567890',
  database: 'ragnarok_db'
}).promise();

module.exports = { connection, pool };
