const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 31853211,
  port: 5432,
});

pool.on('connect', () => {
  console.log('Successfully connected to the database');
});

module.exports = pool;