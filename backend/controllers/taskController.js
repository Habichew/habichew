import * as taskService from "../services/taskService.js";
import * as userService from "../services/userService.js";
import * as habitService from "../services/habitService.js";

export async function getTaskListByUserId(req, res) {
    try {
        const {userId} = req.params;
        const tasks = await taskService.getTaskListByUserId(userId);

        return res.status(200).send(tasks);
    } catch (err) {
        console.error('getTasksByUserId failed:', err);
        res.status(500).json({message:"Failed to fetch task list by user ID", error: err.message});
    }
}

export async function findUserTaskById(req, res) {
    try {
        const {userTaskId} = req.params;

        const task = await taskService.findUserTaskById(userTaskId);
        if (!task) {
            return res.status(404).send({message: "No task found"});
        }
        res.status(200).send(task);
    } catch (err) {
        res.status(500).send({ message:"Find task by userTaskId error", error: err.message });
    }
}


export async function createTask(req, res) {
    try {
        const {task} = req.body;
        const {userId} = req.params;

        // Check if task was provided in request body
        if (!task) {
            return res.status(400).json({ message: "No object 'task' provided in request body" });
        }
        if (!task.customTitle && !task.taskId) {
            return res.status(400).json({ message: "Choose a preset task or input a custom task title!" })
        }

        const existingUserHabit = await habitService.getUserHabit(userId, task.userHabitId);
        if (!existingUserHabit || existingUserHabit.length === 0) {
            return res.status(404).send({message: "This habit does not exist."})
        }
        const newUserTaskId = await taskService.createTask(task);
        const newTask = await taskService.findUserTaskById(newUserTaskId);
        res.status(201).json(newTask);
    } catch (err) {
        console.error('Create error:', err);
        return res.status(500).json({message:"Failed to create a task", error: err.message});
    }
}

export async function updateTask(req, res) {
    try {
        const {userId, userTaskId} = req.params;
        const {task} = req.body;

        // Check if task was provided in request body
        if (!task) {
            return res.status(400).json({message: `No object 'task' provided in request body`});
        }

        // Get current task from DB, to update the changed fields only
        const currentTask = await taskService.findUserTaskById(userTaskId);
        if (!currentTask || currentTask.length === 0) {
            return res.status(404).json({message: `Task does not exist`});
        }

        // check if task has a valid habit
        // YANG: this conditional statement is not necessary, if other data are handled nicely and all tasks have belonging habits
        const habitResult = await habitService.getUserHabit(userId, currentTask.userHabitId);
        if (!habitResult || habitResult.length === 0) {
            return res.status(404).json({message: `Task does not have a valid habit id`});
        }

        let completeTask = task.completed && !currentTask.completed;
        if (completeTask) {
            // update last time user completed any task in user table
            const userResult = await userService.updateUserTaskLastCompleted(habitResult.userId);
        }

        await taskService.updateTask(userTaskId, task, completeTask);

        // Optionally re-fetch the updated task
        const result = await taskService.findUserTaskById(userTaskId);
        return res.status(200).send({
            message: 'Task updated successfully',
            task: result,
        });
    } catch (err) {
        console.error('Update error:', err);
        return res.status(500).json({message:"Failed to update the task", error: err.message});
    }
}

export async function deleteTask(req, res) {
    try {
        const {userId, userTaskId} = req.params;

        const deleted = await taskService.deleteTask(userTaskId);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).send({message: 'Task deleted successfully'});
    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ message:"Failed to delete the task", error: err.message });
    }
}

export async function getPresetTasks(req, res) {
    try {
        const { habitId } = req.params;
        const task = await taskService.getPresetTasks(habitId);
        if (!task || task.length === 0) {
            return res.status(404).json({message: 'No preset task found.'});
        }
        res.status(200).json(task);
    } catch (err) {
        console.error('findPresetTaskById failed:', err);
        return res.status(500).json({message: 'Failed to fetch preset tasks', error: err.message});
    }
}
