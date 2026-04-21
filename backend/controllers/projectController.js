import pool from "../db.js";

export const createProject = async (req, res) => {
  try {
    const { workspace_id, name, description, status, priority, start_date, end_date } = req.body;
    const result = await pool.query(
      `INSERT INTO projects (workspace_id, name, description, status, priority, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [workspace_id, name, description, status || "PLANNING", priority || "MEDIUM", start_date, end_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Project creation failed" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, start_date, end_date, progress } = req.body;
    const result = await pool.query(
      `UPDATE projects SET
         name        = COALESCE($1, name),
         description = COALESCE($2, description),
         status      = COALESCE($3, status),
         priority    = COALESCE($4, priority),
         start_date  = COALESCE($5, start_date),
         end_date    = COALESCE($6, end_date),
         progress    = COALESCE($7, progress),
         updated_at  = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, status, priority, start_date || null, end_date || null, progress, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Project update failed" });
  }
};

// NEW: POST /api/projects/members
export const addProjectMember = async (req, res) => {
  try {
    const { project_id, user_id, role } = req.body;
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [project_id, user_id, role || "member"]
    );
    res.json({ message: "Member added to project" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add project member" });
  }
};
