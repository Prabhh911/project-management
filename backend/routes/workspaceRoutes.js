import express from "express";
import { getWorkspaces, addMember } from "../controllers/workspaceController.js";

const router = express.Router();

router.get("/", getWorkspaces);

router.post("/members", addMember);

export default router;