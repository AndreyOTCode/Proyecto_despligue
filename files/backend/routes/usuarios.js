// backend/routes/usuarios.js
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

const router = express.Router();

// 📂 Configuración de multer para subir imágenes
const uploadDir = path.join(__dirname, '../uploads/fotos_usuarios');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombreArchivo = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, nombreArchivo);
  }
});

const upload = multer({ storage });

// 📌 Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, telefono, email, fecha_nacimiento, rol, foto FROM usuarios'
    );
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// 📌 Crear usuario (con foto opcional)
router.post('/', upload.single('foto_archivo'), async (req, res) => {
  try {
    const { nombre, email, telefono, fecha_nacimiento, rol, contrasena, foto_url } = req.body;

    // Definir foto final: si hay archivo, usar su path, si no, usar URL
    let fotoFinal = '';
    if (req.file) {
      fotoFinal = `/uploads/fotos_usuarios/${req.file.filename}`;
    } else if (foto_url && foto_url.trim() !== '') {
      fotoFinal = foto_url.trim();
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, telefono, fecha_nacimiento, rol, contrasena, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono, fecha_nacimiento, rol, hashedPassword, fotoFinal]
    );

    res.json({ id: resultado.insertId, foto: fotoFinal });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// 📌 Actualizar usuario (con foto opcional)
router.put('/:id', upload.single('foto_archivo'), async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, email, telefono, fecha_nacimiento, rol, contrasena, foto_url } = req.body;

    // Si envían contraseña, encriptar
    if (contrasena && contrasena.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      contrasena = await bcrypt.hash(contrasena, salt);
    } else {
      const [rows] = await pool.query('SELECT contrasena FROM usuarios WHERE id = ?', [id]);
      contrasena = rows[0].contrasena;
    }

    // Foto final: si hay archivo, usarlo; si no, si hay URL; si no, mantener la actual
    let fotoFinal;
    if (req.file) {
      fotoFinal = `/uploads/fotos_usuarios/${req.file.filename}`;
    } else if (foto_url && foto_url.trim() !== '') {
      fotoFinal = foto_url.trim();
    } else {
      const [rows] = await pool.query('SELECT foto FROM usuarios WHERE id = ?', [id]);
      fotoFinal = rows[0].foto;
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, fecha_nacimiento = ?, rol = ?, contrasena = ?, foto = ? WHERE id = ?',
      [nombre, email, telefono, fecha_nacimiento, rol, contrasena, fotoFinal, id]
    );

    res.json({ mensaje: 'Usuario actualizado', foto: fotoFinal });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// 📌 Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Obtener usuarios filtrados por rol
router.get('/artistas', async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, rol, foto
      FROM usuarios
      WHERE rol IN ('barbero', 'tatuador')
    `;
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo artistas:', err);
    res.status(500).json({ error: 'Error obteniendo artistas' });
  }
});



module.exports = router;
