import {pool} from "../config/db.js";

export async function markTaskCompleted(userTaskId) {
    return await pool.query(
        `UPDATE userTasks
        SET completed=TRUE, completedAt = CURRENT_TIMESTAMP 
         WHERE id=?`,
        [userTaskId]);
}


export async function getPresetTasks(habitId) {
    return await pool.query(
        `SELECT id as taskId, title, habitId, description FROM tasks 
         WHERE habitId=?`,
        [habitId]);
}


export async function getTaskListByUserId(userId) {
    return await pool.query(`
        SELECT
            uh.id AS userHabitId,
            ut.id AS userTaskId,
            COALESCE(ut.customTitle, t.title) AS taskTitle,
            ut.description,
            ut.completed,
            ut.credit,
            ut.priority,
            ut.dueAt,
            ut.createdAt, 
            ut.completedAt
        FROM userTasks ut
                 JOIN userHabits uh ON ut.userHabitId = uh.id
                 LEFT JOIN tasks t ON ut.taskId = t.id
        WHERE uh.userId = ?`, [userId]);
}

export async function findUserTaskById(userTaskId) {
    const row = await pool.query(`
        SELECT
            ut.userHabitId,
            ut.id AS userTaskId,
            COALESCE(ut.customTitle, t.title) AS taskTitle,
            ut.description,
            ut.completed,
            ut.credit,
            ut.priority,
            ut.dueAt,
            ut.completedAt,
            ut.createdAt
        FROM userTasks ut
                 LEFT JOIN tasks t ON ut.taskId = t.id
        WHERE ut.id = ?`, [userTaskId]);
    console.log("found userTask", row[0]);
    return row[0];
}

export async function createTask({
                                     taskId,
                                     customTitle,
                                     userHabitId,
                                     description,
                                     priority,
                                     dueAt,
                                     credit
                                 }) {
    // verify if the object task is legal
    if (!userHabitId) throw new Error("userHabitId is required");

    const result = await pool.query(`
    INSERT INTO userTasks (taskId, customTitle, userHabitId, description, priority, dueAt, credit)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [taskId || null, customTitle || null, userHabitId, description, priority, dueAt, credit]
    );

    return result.insertId;
}

export async function updateTask(userTaskId, task, completeTask) {
    const allowedFields = ['customTitle', 'description', 'priority', 'dueAt', 'completed', 'credit'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
        if (field in task) {
            setClauses.push(`${field} = ?`);
            values.push(task[field]);
        }
    }

    if (completeTask) {
        setClauses.push(`completedAt = NOW()`);
    }

    if (setClauses.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    values.push(userTaskId);

    const result = await pool.query(
        `UPDATE userTasks SET ${setClauses.join(', ')} WHERE id = ?`,
        values
    );

    return result.affectedRows > 0;
}

export async function calculateTaskCredit(userTask) {
    const BASE = 10;
    let credit = BASE;

    const { priority, dueAt, completedAt, createdAt } = userTask;
    console.log("dueAt: ", dueAt,"\ncompletedAt: ", completedAt, "\ncreatedAt: ", createdAt);

    // 1. 处理 priority 系数
    let priorityCoefficient = 1;
    if (priority) {
        const priorityMap = {
            low: 1,
            medium: 1.2,
            high: 1.4,
        };
        priorityCoefficient = priorityMap[priority.toLowerCase()] || 1;
    }

    // 2. 处理 due 系数
    let dueCoefficient = 1;
    if (dueAt && completedAt && createdAt) {
        const dueAtTime = new Date(dueAt).getTime();
        const completedAtTime = new Date(completedAt).getTime();
        const createdAtTime = new Date(createdAt).getTime();

        const denominator = dueAtTime - createdAtTime;

        // 确保分母大于0，避免除零错误
        if (denominator > 0) {
            const numerator = dueAtTime - completedAtTime;
            dueCoefficient = 1 + (numerator / denominator);
        }
        console.log("dueCoefficient: ",dueCoefficient);
    }

    // 3. 应用系数（乘法叠加）
    credit = BASE * priorityCoefficient * dueCoefficient;

    return Math.max(0, Math.round(credit)); // Round the result, make the minimum to 0
}

export async function deleteTask(userTaskId) {
    const result = await pool.query('DELETE FROM userTasks WHERE id = ?', [userTaskId]);
    return result.affectedRows > 0;
}