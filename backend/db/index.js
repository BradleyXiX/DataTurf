const { Pool } = require('pg');
require('dotenv').config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

let poolConfig = {};

if (connectionString) {
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  poolConfig = {
    connectionString,
    ssl: isLocal
      ? false
      : {
          rejectUnauthorized: false,
        },
  };
} else {
  const isLocalHost =
    !process.env.DB_HOST ||
    process.env.DB_HOST === 'localhost' ||
    process.env.DB_HOST === '127.0.0.1' ||
    process.env.DB_HOST === 'db';

  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dataturf',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    ssl:
      !isLocalHost || process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  };

  if (!process.env.DB_PASSWORD) {
    console.warn("WARNING: DB_PASSWORD is not set. Database connection may fail in production.");
  }
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
