import pool from "../db.js";

export const createProject = async (req, res) => {
  try {
    const {
      workspace_id,
      name,
      description,
      status,
      priority,
      start_date,
      end_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO projects 
      (workspace_id, name, description, status, priority, start_date, end_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [workspace_id, name, description, status, priority, start_date, end_date]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Project creation failed" });
  }
};