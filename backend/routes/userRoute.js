import express from "express";
const userRouter = express.Router();
import * as userController from "../controllers/userController.js";
import * as petController from "../controllers/petController.js";
import * as taskController from "../controllers/taskController.js";


// ============== User Profile Information ================== //
// Get all users's information
userRouter.get("/", userController.getAllUsers);

// Auth: Login, Register
userRouter.post("/login", userController.findUser);

userRouter.post("/signup", userController.signUp);

// Profile by user id
userRouter.get("/:userId", userController.findUserById);

userRouter.get("/:userId/email", userController.findEmailById);

userRouter.get("/:userId/password", userController.findPasswordById);

userRouter.get("/:userId/username", userController.findUsernameById);

userRouter.get("/:userId/profileImage", userController.findProfileImageById);

userRouter.put("/:userId", userController.updateUser);

userRouter.put("/:userId/email", userController.updateEmailById);

userRouter.put("/:userId/password", userController.updatePasswordById);

userRouter.put("/:userId/username", userController.updateUsernameById);

/*userRouter.put("/:userId/profileImage", userController.updateProfileImageById);*/

userRouter.delete("/:userId", userController.deleteUser);

// ====================== User Pets ======================= //
// Find pet by user id
userRouter.get("/:userId/pet", petController.findPetByUserId);

// Create pet
userRouter.post("/:userId/pet", petController.createPet);

// Update pet
userRouter.put("/:userId/pet", petController.updatePet);

// Delete pet
userRouter.delete("/:userId/pet", petController.deletePet);

// ====================== User Tasks ======================= //

// Get all tasks belonging to a user by userId
userRouter.get("/:userId/tasks", taskController.getTaskListByUserId);

// Get a task details by userTaskId
userRouter.get("/:userId/tasks/:userTaskId", taskController.findUserTaskById);

// Create a task
userRouter.post("/:userId/tasks", taskController.createTask);

// Complete a task
userRouter.patch("/:userId/tasks/:userTaskId/completed", taskController.completeTask);

// Update a task
userRouter.patch("/:userId/tasks/:userTaskId", taskController.updateTask);

// Delete a task by userTaskId
userRouter.delete("/:userId/tasks/:userTaskId", taskController.deleteTask);

export {userRouter};