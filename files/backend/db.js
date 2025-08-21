//backend/db.js
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  password: process.env.DB_NAME,
  multipleStatements: true, // opcional
}).promise();

async function setupDatabase() {
  try {

    await pool.query(`CREATE DATABASE IF NOT EXISTS ragnarok_db`);
    console.log("✅ Base de datos 'ragnarok_db' lista");

    await pool.query(`USE ragnarok_db`);

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
        foto VARCHAR(255),
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
      await pool.promise().query(table);
    }

    console.log("✅ Tablas listas en 'ragnarok_db'");

    // === Insertar usuarios iniciales ===
    const usuarios = [
      ['Andrey Osorio', '3128282746', 'osorioandrey97@gmail.com', '1997-07-31', '$2b$10$hsc8w66/J4jIhMqbUX9Y2eZQpIsWL7FVQkLs0QB1Dfby.G0O78apq', 'admin', null, '2025-05-20 16:54:31'],
      ['Jessica Fajardo', '3155444455', 'jessica@gmail.com', '1998-09-19', '$2b$10$t5H6YRTXzeI66MeGvjYzVOAG1MgQnp0zhLs2bYr9e1e9WJDBnYz7i', 'tatuador', 'https://media.gettyimages.com/id/1032882008/es/foto/retrato-de-estudio-de-un-tatuador-sobre-un-fondo-amarillo.jpg?s=612x612&w=gi&k=20&c=cTkz-RDcF60goJMA6pFKgm7H9VuJEJxXvq6aqG1QJrg=', '2025-05-20 16:55:36'],
      ['pedro Pablo', '3155444455', 'pedro@gmail.com', '2025-05-15', '$2b$10$750V/kyPQ.LYbtnrJR.Mq.zKj/3FXE42qN9yxAyyYJ.4BHwVLZNQG', 'barbero', 'https://cdn.prod.website-files.com/65489618a9e91669c78068e2/65a022b1c7a2056754bb8305_CV%20barbero%201.jpg', '2025-05-20 17:08:28'],
      ['daniela', '32112542325', 'daniela@gmail.com', '2025-08-09', '$2b$10$ah5SeIAPIeFXUDAJVaSbReS1FixEPIWCbZK0wbfyl1abelSRzzehy', 'barbero', 'https://www.elespectador.com/resizer/v2/OMTV66O42RAMZILNY6MVVHCF7E.jpg?auth=77b39a455ef21dcd19bd2151cf3424d90c7a61bc9858739f9ddc96110c444109&width=920&height=613&smart=true&quality=70', '2025-08-10 18:39:20'],
      ['mauricio', '545855888', 'mauricio@gmail.com', '1999-07-01', '$2b$10$4A3SHPg4eYb6h2lbZOmj0up9GFirhi0apQVAwSKQRpw7B.aDALqXa', 'tatuador', 'https://media.istockphoto.com/id/636373456/es/foto/el-maestro-del-tatuaje-es-tatuar-en-el-tattoosalon.jpg?s=612x612&w=0&k=20&c=qGcH_Z0UwzCYlaTpQVQfVU_dGM2fIVIw61-4wjn2MrY=', '2025-08-13 13:06:41']
    ];

    for (const u of usuarios) {
      await pool.query(`
        INSERT INTO usuarios (nombre, telefono, email, fecha_nacimiento, contrasena, rol, foto, fecha_registro)
        SELECT * FROM (SELECT ? AS nombre, ? AS telefono, ? AS email, ? AS fecha_nacimiento, ? AS contrasena, ? AS rol, ? AS foto, ? AS fecha_registro) AS tmp
        WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = ?) LIMIT 1;
      `, [...u, u[2]]);
    }

    // === Insertar productos iniciales ===
    const productos = [
      ['Cera para cabello NISH MAN Gel Wax', 'hair cera para cabello hombre NISH MAN Gold One 150ml', 'https://barbershoponline.es/wp-content/uploads/2024/09/Nishman-09.jpg', 30000.00, 8, 'barberia', '2025-06-18 20:59:54'],
      ['Cera para cabello NISH MAN', 'hair cera para cabello hombre NISH MAN 100ml', 'https://kamill.vteximg.com.br/arquivos/ids/159673-1000-1000/8682035081104.jpg?v=638449311277870000', 35000.00, 9, 'barberia', '2025-06-18 20:59:54'],
      ['Cera para cabello NISH MAN matte', 'hair cera para cabello hombre NISH MAN wax matte 150ml', 'https://pelosur.es/3240-large_default/nishman-hair-styling-wax-matte-08-150ml.jpg', 25000.00, 8, 'barberia', '2025-06-18 20:59:54'],
      ['Cera para cabello PREMIUM', 'hair cera para hombre PREMIUM 200ml', 'https://parabarberos.co/wp-content/uploads/2024/08/CERA-PREMIUM-3.png', 25000.00, 12, 'barberia', '2025-06-18 20:59:54'],
      ['Cera para Barba BLAC ROLDA', 'Cera para Barba, BLAC ROLDA', 'https://tiendadistrisae.com/wp-content/uploads/2024/02/DistriSAE17-1.jpg', 23000.00, 10, 'barberia', '2025-06-18 20:59:54'],
      ['Shampoo con Minoxidil', 'Shampoo sin Sal y con Minoxidil 240ml', 'https://http2.mlstatic.com/D_NQ_NP_828561-MLM49353739394_032022-O.webp', 40000.00, 10, 'barberia', '2025-06-18 20:59:54'],
      ['Laca para el cabello', 'Laca flexible #1 Salon IN 280ml', 'https://palatsi.com.co/cdn/shop/products/WhatsAppImage2021-08-09at12.15.16_grande.jpg?v=1628529373', 37000.00, 15, 'barberia', '2025-06-18 20:59:54'],
      ['Patillera Uso Personal', 'Patillera personal KEMEI', 'https://elmeromacho.co/cdn/shop/files/PatilleraKemeiKM-157903.png?v=1712796050&width=480', 120000.00, 5, 'barberia', '2025-06-18 20:59:54'],
      ['ACID MANTLE TATTOO', 'Crema especial para el cuidado Post Tatuaje 30 gr', 'https://lh3.googleusercontent.com/YiA3rmOyxz5Z3UThVeWas80Ytit6qsOlxIMBEWMQ5u1ySl4wCaGye00OFDjFhnik8g01kyWZkCTjD8SogSLCay4kKFGuRgKncbnYXVZi1S9ru3LY', 20000.00, 19, 'tatuajes', '2025-06-18 20:59:54'],
      ['Locion After Inked', 'Loción especial para mantener el color vivo de los tatuajes 90mil', 'https://www.stretchitbodyjewellery.co.uk/cdn/shop/files/after-inked-premium-tattoo-aftercare-lotion.jpg?v=1712570859', 25000.00, 15, 'tatuajes', '2025-06-18 20:59:54'],
      ['Jabón Green Soap', 'Jabón especial para el lavado del tatuaje recién hecho 500ml', 'https://eztattoosupply.co/cdn/shop/products/Green_Soap_500_ml_1080x.jpg?v=1670072380', 30000.00, 18, 'tatuajes', '2025-06-18 20:59:54'],
      ['Tatuajes Temporales', 'Fakes tattoos, para probar estilos antes de tatuarte', 'https://image.made-in-china.com/202f0j00tuDqHnIEIVba/Hot-Selling-Popular-3D-Temporary-Body-Cool-Tattoo-Stickers.webp', 5000.00, 45, 'tatuajes', '2025-06-18 20:59:54'],
      ['Parches Post Tattoo', 'Parches para proteger tu tatuaje del exterior', 'https://m.10masters.com/images/parche-saniderm-tatuajes.max-1000x1000.format-webp.webp', 10000.00, 30, 'tatuajes', '2025-06-18 20:59:54'],
      ['Crema TKTX 75%', 'Crema anestésica para tolerar mejor el dolor de los tatuajes', 'https://atramento.com.co/wp-content/uploads/2023/02/crema-tktx-75-porciento-negra.jpg', 50000.00, 12, 'tatuajes', '2025-06-18 20:59:54'],
      ['Bepanthol Solar Tattoo', 'Crema solar para el cuidado de los tatuajes 50ml', 'https://www.bepanthol.es/sites/g/files/vrxlpx50831/files/2023-05/protectora_11.png', 60000.00, 10, 'tatuajes', '2025-06-18 20:59:54'],
      ['shampoo Karicia', 'Shampoo con minoxidil 400ml', 'https://barbamen.co/wp-content/uploads/2022/02/Shampoo-Karicia.webp', 30000.00, 10, 'barberia', '2025-08-11 08:20:08'],
      ['Crema para Tattoo Proton', 'crema para tatuar proton', 'https://http2.mlstatic.com/D_NQ_NP_756938-MCO72515143797_102023-O.webp', 35000.00, 20, 'tatuajes', '2025-08-12 09:39:16']
    ];

    for (const p of productos) {
      await pool.query(`
        INSERT INTO productos (nombre, descripcion, imagen_url, precio, stock, categoria, fecha_creacion)
        SELECT * FROM (SELECT ? AS nombre, ? AS descripcion, ? AS imagen_url, ? AS precio, ? AS stock, ? AS categoria, ? AS fecha_creacion) AS tmp
        WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = ?) LIMIT 1;
      `, [...p, p[0]]);
    }

    pool.end();
  } catch (error) {
    console.error("❌ Error creando base de datos o tablas:", error);
  }
}


module.exports = { pool, setupDatabase };
