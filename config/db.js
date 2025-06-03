const mysql = require('mysql2/promise');
require('dotenv').config();

// Validate required env vars for better debugging
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error('Missing one or more required DB environment variables.');
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,  // ensure port is a number, default to 3306
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
