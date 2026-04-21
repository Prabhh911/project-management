import pool from "../db.js";

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, status, priority, type, assignee_id, due_date } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks 
      (project_id, title, description, status, priority, type, assignee_id, due_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      // FIX: type was missing from INSERT — always defaulted to 'TASK' in DB
      [project_id, title, description, status || "TODO", priority || "MEDIUM", type || "TASK", assignee_id, due_date]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task creation failed" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, type, assignee_id, due_date } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET
         status      = COALESCE($1, status),
         title       = COALESCE($2, title),
         description = COALESCE($3, description),
         priority    = COALESCE($4, priority),
         type        = COALESCE($5, type),
         assignee_id = COALESCE($6, assignee_id),
         due_date    = COALESCE($7, due_date),
         updated_at  = NOW()
       WHERE id = $8
       RETURNING *`,
      [status, title, description, priority, type, assignee_id, due_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task update failed" });
  }
};

export const deleteTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Task deletion failed" });
  }
};
