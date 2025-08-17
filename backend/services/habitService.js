import pool from "../config/db.js";

export async function getHabitCategories() {
  return await pool.query(`
    SELECT * FROM habitCategories`);
}

export async function getPresetHabits(categoryId) {
  return await pool.query(`
    SELECT h.id as habitId, h.title, c.id, c.name AS categoryName
    FROM habits h
           LEFT JOIN habitCategories c ON h.categoryId = c.id
    WHERE h.categoryId = ?;`,[categoryId]);
}

export async function getUserHabitList(userId) {
  return await pool.query(`
    SELECT
      uh.id AS userHabitId,
      COALESCE(uh.customTitle, h.title) AS habitTitle,
      uh.priority,
      uh.startDate,
      uh.goalDate,
      uh.frequency,
      uh.isArchived
    FROM userHabits uh
    LEFT JOIN habits h ON uh.habitId = h.id
    WHERE uh.userId = ?;`, [userId]);
}

export async function getUserHabit(userId, userHabitId) {
  const rows = await pool.query(`
    SELECT
      uh.id AS userHabitId,
      COALESCE(uh.customTitle, h.title) AS habitTitle,
      uh.priority,
      uh.startDate,
      uh.goalDate,
      uh.frequency,
      uh.isArchived
    FROM userHabits uh
    LEFT JOIN habits h ON uh.habitId = h.id
    WHERE uh.userId = ? AND uh.id = ?;`, [userId, userHabitId]);
  return rows[0];
}

export async function createHabitByUser(userId, habitId, customTitle, priority, startDate, goalDate,frequency){

  if (startDate && goalDate && new Date(startDate) > new Date(goalDate)) {
    throw new Error('startDate must be before goalDate');
  }

  // Insert into userHabits as custom habit
  const result = await pool.query(
      `INSERT INTO userHabits
     (userId, habitId, customTitle, priority, startDate, goalDate, frequency)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, habitId, customTitle, priority, startDate, goalDate, frequency]
  );

  const userHabitId = result.insertId;

  // Return inserted record
  const rows = await pool.query(
      `SELECT
         uh.id AS userHabitId,
         COALESCE(uh.customTitle, h.title) AS habitTitle,
         uh.priority,
         uh.startDate,
         uh.goalDate,
         uh.frequency,
         uh.isArchived
       FROM userHabits uh
              LEFT JOIN habits h ON uh.habitId = h.id
       WHERE uh.id = ?;`, [userHabitId]);
  return rows[0];

}

export async function updateHabitByUser(userId, userHabitId, customTitle, priority, startDate, goalDate,frequency, isArchived){

  const [existing] = await pool.query(`
    SELECT startDate, goalDate
    FROM userHabits
    WHERE id = ? AND userId = ?
  `, [userHabitId, userId]);

  if (!existing) {
    throw new Error('Habit not found');
  }

// Verify the start date and goal date logic:
  if (startDate && goalDate && new Date(startDate) > new Date(goalDate)) {
    throw new Error('startDate must be before goalDate');
  }

  if (startDate && !goalDate && existing.goalDate && new Date(startDate) > new Date(existing.goalDate)) {
    throw new Error('startDate must be before existing goalDate');
  }

  if (goalDate && !startDate && existing.startDate && new Date(existing.startDate) > new Date(goalDate)) {
    throw new Error('goalDate must be after existing startDate');
  }

  // Insert into userHabits as custom habit
  const result = await pool.query(
      `UPDATE userHabits SET
      customTitle = COALESCE(?, customTitle),
      priority = COALESCE(?, priority),
      startDate = COALESCE(?, startDate),
      goalDate = COALESCE(?, goalDate),
      frequency = COALESCE(?, frequency),
      isArchived = COALESCE(?, isArchived)
  WHERE id = ? AND userId = ?`,
    [customTitle, priority, startDate, goalDate, frequency, isArchived, userHabitId, userId]
  );

  // Return inserted record
  const rows = await pool.query(
      `SELECT
         uh.id AS userHabitId,
         COALESCE(uh.customTitle, h.title) AS habitTitle,
         uh.priority,
         uh.startDate,
         uh.goalDate,
         uh.frequency,
         uh.isArchived
       FROM userHabits uh
              LEFT JOIN habits h ON uh.habitId = h.id
       WHERE uh.id = ?;`, [userHabitId]);
  return rows[0];

}

export async function deleteUserHabit (userId, userHabitId) {
    const result = await pool.query(
        `DELETE FROM userHabits WHERE id = ? AND userId = ?`,
        [userHabitId, userId]
    );

    return result.affectedRows > 0;
}

/* import { pipeline, env } from '@huggingface/transformers';

class MyClassificationPipeline {
  static task = 'text-generation';
  static model = 'TinyLlama-1.1B-Chat-v1.0-onnx';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // NOTE: Uncomment this to change the cache directory
      env.cacheDir = './.cache';
      env.localModelPath = './.models';
      env.allowRemoteModels = false;
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

const pipe = await pipeline("text-generation", "TinyLlama/TinyLlama-1.1B-Chat-v1.0");
*/

export async function getTaskRecommendations(conn, callback) {
  /*console.log("get task recommendations from TinyLlama");
  const classifier = await MyClassificationPipeline.getInstance();
  const result = await classifier(text);*/
  callback(result);
}
