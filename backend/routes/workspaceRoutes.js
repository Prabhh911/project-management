import express from "express";
import { getWorkspaces, createWorkspace, addMember } from "../controllers/workspaceController.js";

const router = express.Router();

router.get("/",         getWorkspaces);
router.post("/",        createWorkspace); // NEW: create workspace
router.post("/members", addMember);

export default router;
