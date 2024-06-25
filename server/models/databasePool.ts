import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.AWS_RDS_ENDPOINT,
  user: process.env.AWS_RDS_USER,
  password: process.env.AWS_RDS_KEY,
  database: process.env.AWS_RDS_DATABASE,
  // host: process.env.MYSQL_HOST,
  // user: process.env.MYSQL_USER,
  // password: process.env.MYSQL_PASSWORD,
  // database: process.env.MYSQL_DATABASE,
});

export default pool;
