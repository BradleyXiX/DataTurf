const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

if (!process.env.DB_PASSWORD) {
  console.warn("WARNING: DB_PASSWORD is not set. Database connection may fail in production.");
}

module.exports = {
  query: (text, params) => pool.query(text, params),
};
