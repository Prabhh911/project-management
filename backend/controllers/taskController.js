export const createTask = async (req, res) => {
  try {
    const {
      project_id,
      title,
      description,
      status,
      priority,
      assignee_id,
      due_date,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks 
      (project_id, title, description, status, priority, assignee_id, due_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [project_id, title, description, status, priority, assignee_id, due_date]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Task creation failed" });
  }
};