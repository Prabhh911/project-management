import pool from "../db.js";

// GET /api/workspaces
export const getWorkspaces = async (req, res) => {
  try {
    const workspacesRes = await pool.query(`SELECT * FROM workspaces`);
    const workspaces = workspacesRes.rows;

    for (let workspace of workspaces) {
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
        user: { id: m.user_id, name: m.name, email: m.email },
      }));

      if (workspace.owner_id) {
        const ownerRes = await pool.query(`SELECT id, name, email FROM users WHERE id = $1`, [workspace.owner_id]);
        workspace.owner = ownerRes.rows[0] || null;
      } else {
        workspace.owner = null;
      }

      const projectsRes = await pool.query(`SELECT * FROM projects WHERE workspace_id = $1`, [workspace.id]);
      const projects = projectsRes.rows;

      for (let project of projects) {
        const projMembersRes = await pool.query(
          `SELECT pm.id, pm.role, u.id AS user_id, u.name, u.email
           FROM project_members pm
           JOIN users u ON u.id = pm.user_id
           WHERE pm.project_id = $1`,
          [project.id]
        );
        project.members = projMembersRes.rows.map((m) => ({
          id: m.id, role: m.role,
          user: { id: m.user_id, name: m.name, email: m.email },
        }));

        const tasksRes = await pool.query(
          `SELECT t.*, u.id AS assignee_user_id, u.name AS assignee_name, u.email AS assignee_email
           FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
           WHERE t.project_id = $1`,
          [project.id]
        );
        project.tasks = tasksRes.rows.map((t) => ({
          id: String(t.id), project_id: String(t.project_id),
          title: t.title, description: t.description,
          status: t.status, priority: t.priority, type: t.type || "TASK",
          due_date: t.due_date, created_at: t.created_at, updated_at: t.updated_at,
          assignee: t.assignee_user_id
            ? { id: String(t.assignee_user_id), name: t.assignee_name, email: t.assignee_email }
            : null,
        }));
      }

      workspace.projects = projects.map((p) => ({ ...p, id: String(p.id), workspace_id: String(p.workspace_id) }));
    }

    res.json(workspaces.map((w) => ({ ...w, id: String(w.id) })));

  } catch (err) {
    console.error("getWorkspaces error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/workspaces  — create a new workspace
export const createWorkspace = async (req, res) => {
  try {
    const { name, owner_id } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Workspace name is required" });

    const result = await pool.query(
      `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *`,
      [name.trim(), owner_id || null]
    );
    const workspace = result.rows[0];

    // Auto-add owner as ADMIN member if owner_id provided
    if (owner_id) {
      await pool.query(
        `INSERT INTO workspace_members (workspace_id, user_id, role)
         VALUES ($1, $2, 'ADMIN') ON CONFLICT DO NOTHING`,
        [workspace.id, owner_id]
      );
    }

    res.json({ ...workspace, id: String(workspace.id), members: [], projects: [], owner: null });

  } catch (err) {
    console.error("createWorkspace error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/workspaces/members
export const addMember = async (req, res) => {
  try {
    const { workspace_id, user_id, role } = req.body;
    await pool.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3) ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspace_id, user_id, role || "member"]
    );
    res.json({ message: "Member added" });
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ error: err.message });
  }
};
