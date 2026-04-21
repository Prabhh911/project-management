import express from "express";
import { createTask, updateTask, deleteTaskById } from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.patch("/:id", updateTask);       // NEW: update status/fields
router.delete("/:id", deleteTaskById);  // NEW: delete a single task

export default router;
