import pg from "pg";
import dotenv from "dotenv";
dotenv.config();


const db = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect();

export default db;