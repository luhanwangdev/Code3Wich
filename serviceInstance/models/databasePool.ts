import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const localServerPath = "C:/Users/sherr/OneDrive/桌面/AWS/mySandBox/server/";
const local = process.env.SERVER_PATH === localServerPath;

const host = local ? process.env.MYSQL_HOST : process.env.AWS_RDS_ENDPOINT;
const user = local ? process.env.MYSQL_USER : process.env.AWS_RDS_USER;
const password = local ? process.env.MYSQL_PASSWORD : process.env.AWS_RDS_KEY;
const database = local
  ? process.env.MYSQL_DATABASE
  : process.env.AWS_RDS_DATABASE;

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  // host: process.env.MYSQL_HOST,
  // user: process.env.MYSQL_USER,
  // password: process.env.MYSQL_PASSWORD,
  // database: process.env.MYSQL_DATABASE,
});

export default pool;
