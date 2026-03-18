import pool from "../db.js";

// ✅ GET WORKSPACES
export const getWorkspaces = async (req, res) => {
  try {

    const workspacesRes = await pool.query(`SELECT * FROM workspaces`);
    const workspaces = workspacesRes.rows;

    for (let workspace of workspaces) {

      const projectsRes = await pool.query(
        `SELECT * FROM projects WHERE workspace_id = $1`,
        [workspace.id]
      );

      const projects = projectsRes.rows;

      for (let project of projects) {

        const tasksRes = await pool.query(
          `SELECT * FROM tasks WHERE project_id = $1`,
          [project.id]
        );

        project.tasks = tasksRes.rows;
        project.members = []; // safe fallback
      }

      workspace.projects = projects;
      workspace.members = []; // safe fallback
    }

    res.json(workspaces);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ADD MEMBER (THIS WAS MISSING ❌)
export const addMember = async (req, res) => {
  try {

    const { workspace_id, user_id, role } = req.body;

    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1,$2,$3)`,
      [workspace_id, user_id, role]
    );

    res.json({ message: "Member added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add member" });
  }
};