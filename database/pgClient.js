// database/pgClient.js
const { Pool } = require('pg');
require('dotenv').config();

// Verificar que la variable de entorno esté definida
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: La variable de entorno DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

// Crear un pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuración adicional para mejorar la robustez
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para consultar la base de datos
const query = (text, params) => pool.query(text, params);

// Función para cerrar el pool (útil al apagar la app)
const close = () => pool.end();

// Exportar las funciones para usarlas en otros módulos
module.exports = {
  query,
  close,
};