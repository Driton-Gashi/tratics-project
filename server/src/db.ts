import mysql, { Pool } from 'mysql2';

import dotenv from 'dotenv';

dotenv.config();

// Hostinger Database
const pool: Pool = mysql.createPool({
   host: process.env.DATABASE_HOST || '',
   user: process.env.DATABASE_USER || '',
   password: process.env.DATABASE_PASSWORD || '',
   database: process.env.DATABASE_NAME || '',
});

// Local Database
// const pool = mysql.createPool({
//   host: "localhost",
//   user: 'root',
//   password: '',
//   database: 'foodApp',
// });

const db = pool.promise();

export default db;
