import pool from "../db.js";

export const getWorkspaces = async (req, res) => {
  try {
    const workspacesRes = await pool.query(`SELECT * FROM workspaces`);
    const workspaces = workspacesRes.rows;

    for (let workspace of workspaces) {

      // Workspace members
      const membersRes = await pool.query(
        `SELECT wm.id, wm.role, wm.workspace_id,
                u.id AS user_id, u.name, u.email
         FROM workspace_members wm
         JOIN users u ON u.id = wm.user_id
         WHERE wm.workspace_id = $1`,
        [workspace.id]
      );
      workspace.members = membersRes.rows.map((m) => ({
        id: m.id, role: m.role,
        user: { id: String(m.user_id), name: m.name, email: m.email },
      }));

      // Owner
      if (workspace.owner_id) {
        const ownerRes = await pool.query(
          `SELECT id, name, email FROM users WHERE id = $1`, [workspace.owner_id]
        );
        workspace.owner = ownerRes.rows[0] || null;
      } else {
        workspace.owner = null;
      }

      // Projects
      const projectsRes = await pool.query(
        `SELECT * FROM projects WHERE workspace_id = $1`, [workspace.id]
      );

      const projects = projectsRes.rows;

      for (let project of projects) {

        // Project members
        const projMembersRes = await pool.query(
          `SELECT pm.id, pm.role,
                  u.id AS user_id, u.name, u.email
           FROM project_members pm
           JOIN users u ON u.id = pm.user_id
           WHERE pm.project_id = $1`,
          [project.id]
        );
        project.members = projMembersRes.rows.map((m) => ({
          id: m.id, role: m.role,
          user: { id: String(m.user_id), name: m.name, email: m.email },
        }));

        // Tasks with assignee
        const tasksRes = await pool.query(
          `SELECT t.*, u.id AS assignee_user_id, u.name AS assignee_name, u.email AS assignee_email
           FROM tasks t
           LEFT JOIN users u ON u.id = t.assignee_id
           WHERE t.project_id = $1
           ORDER BY t.created_at DESC`,
          [project.id]
        );

        const tasks = tasksRes.rows.map((t) => ({
          id:          String(t.id),
          project_id:  String(t.project_id),
          title:       t.title,
          description: t.description,
          status:      t.status   || "TODO",
          priority:    t.priority || "MEDIUM",
          type:        t.type     || "TASK",
          due_date:    t.due_date,
          created_at:  t.created_at,
          updated_at:  t.updated_at,
          assignee: t.assignee_user_id
            ? { id: String(t.assignee_user_id), name: t.assignee_name, email: t.assignee_email }
            : null,
        }));

        project.tasks = tasks;

        // FIX: auto-calculate progress based on DONE tasks instead of stored value
        const total = tasks.length;
        const done  = tasks.filter((t) => t.status === "DONE").length;
        project.progress = total > 0 ? Math.round((done / total) * 100) : 0;
      }

      workspace.projects = projects.map((p) => ({
        ...p,
        id:           String(p.id),
        workspace_id: String(p.workspace_id),
      }));
    }

    res.json(workspaces.map((w) => ({ ...w, id: String(w.id) })));

  } catch (err) {
    console.error("getWorkspaces error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { workspace_id, user_id, role } = req.body;
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspace_id, user_id, role || "member"]
    );
    res.json({ message: "Member added" });
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ error: err.message });
  }
};
