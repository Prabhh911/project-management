import express from "express";
import { createProject, updateProject, addProjectMember } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", createProject);
router.patch("/:id", updateProject);
router.post("/members", addProjectMember); // NEW: add member to project

export default router;
