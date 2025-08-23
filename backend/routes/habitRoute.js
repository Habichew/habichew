import express from "express";
const habitRouter = express.Router();

import * as habitController from "../controllers/habitController.js";

// Get a user's habit list
habitRouter.get('/:userId', habitController.getHabitListByUser);

// Get a habit's detail
habitRouter.get('/:userId/:userHabitId', habitController.getHabitByUser);

// Create a habit
habitRouter.post('/:userId', habitController.createHabitByUser);

// Complete a habit
habitRouter.patch('/:userId/:userHabitId/completed', habitController.completeHabit);

// Update a habit
habitRouter.patch('/:userId/:userHabitId', habitController.updateHabitByUser);

// Delete a habit
habitRouter.delete('/:userId/:userHabitId', habitController.deleteUserHabit);



export {habitRouter};