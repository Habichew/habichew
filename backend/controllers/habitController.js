import * as habitService from "../services/habitService.js";
import {sendNotImplementedError} from "../index.js";

export async function getHabitCategories(req, res) {
    try {
        const categories = await habitService.getHabitCategories();
        if (categories.length ===0){
            return res.status()
        }
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch habit categories', error: err.message});
    }
}

export async function getPresetHabits(req, res) {
    try {
        const { categoryId } = req.params;
        const presets = await habitService.getPresetHabits(categoryId);
        res.status(200).json(presets);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch preset habits', error: err.message});
    }
}


export async function getHabitListByUser(req, res) {
    try {
        const {userId} = req.params;
        const list = await habitService.getUserHabitList(userId);
        res.status(200).json(list);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch user habit list', error: err.message});
    }
}

export async function getHabitByUser(req, res) {
    try {
        const {userId, userHabitId} = req.params;
        const habit = await habitService.getUserHabit(userId, userHabitId);
        return res.status(200).json(habit);
    } catch (err) {
        return res.status(500).json({message: 'Failed to fetch the habit', error: err.message});
    }
}


export async function createHabitByUser(req, res) {
    try {
        const { userId } = req.params;
        const { habitId, customTitle, priority, startDate, goalDate, frequency } = req.body;


        // Basic validation
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!customTitle && !habitId) {
            return res.status(400).json({message: 'Choose a habit or add your custom one'})
        }

        const habit = await habitService.createHabitByUser(userId, habitId, customTitle, priority, startDate, goalDate, frequency);
        res.status(201).json({ message: 'Habit created', habit });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create habit', error: err.message });
    }
}

export async function updateHabitByUser(req, res) {
    try {
        const { userId, userHabitId } = req.params;
        const { customTitle, priority, startDate, goalDate, frequency, isArchived } = req.body;


        // Basic validation
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!userHabitId) {
            return res.status(400).json({ message: 'Habit Id is required for this user' });
        }

        const habit = await habitService.updateHabitByUser(userId, userHabitId, customTitle, priority, startDate, goalDate, frequency, isArchived);
        return res.status(200).json({ message: 'User habit updated successfully' , habit });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update habit', error: err.message });
    }
}

export async function deleteUserHabit (req,res){
    const {userId,userHabitId} = req.params;

    try {
        const deleted = await habitService.deleteUserHabit(userId, userHabitId);

        if (!deleted) {
            return res.status(404).json({ message: 'Habit not found or already deleted' });
        }

        res.status(200).json({ message: 'Habit and related tasks deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Failed to delete habit', error: err.message });
    }
}

export function getTaskRecommendations(conn, req, res) {
    sendNotImplementedError(res);
    /*
    try {
      habitService.getTaskRecommendations(
          conn,
          req.body.habit,
          (result) => {
            if (result.length === 1) {
              res.status(200);
            } else if (result.length === 0) {
              res.status(403);
            }
            res.send(result);
          }
      );
  } catch (code) {
    res.status(code);
    res.send();
  }
  */
}