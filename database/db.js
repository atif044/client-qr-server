const mysql = require('mysql2');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.HOST,
  user: 'atif786',
  password: 'a12123434A**',
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
