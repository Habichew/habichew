import express from "express";
import * as taskController from "../controllers/taskController.js";

export const taskRouter = express.Router();

// Find tasks by user id
taskRouter.get("/:userId", taskController.getTaskListByUserId);