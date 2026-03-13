import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;

  const result = await pool.query(
    "INSERT INTO tasks(title, description) VALUES($1,$2) RETURNING *",
    [title, description]
  );

  res.json(result.rows[0]);
});

app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});