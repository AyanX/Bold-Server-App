require("dotenv/config");
const mysql = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,

  waitForConnections: true,
  connectionLimit: 10,   // adjust this
  queueLimit: 0
});

const db = drizzle(pool);

module.exports = db;
