import { pool } from "../config/db.js";


export async function findPetById(petId) {
  return await pool.query('SELECT * FROM pets WHERE id = ?', [petId]);
}

export async function createPet(pet) {
  return await pool.query(
      'INSERT INTO pets (name, mood, personality, level, hunger) VALUES (?, ?, ?, ?, ?)',
      [pet.name, pet.mood, pet.personality, pet.level, pet.hunger]
  );
}

export async function updatePet(id, pet) {
  return await pool.query(
      `UPDATE pets
         SET name = ?,
             mood = ?,
             personality = ?,
             level = ?,
             hunger = ?
         WHERE id = ?`,
      [
        pet.name,
        pet.mood,
        pet.personality,
        pet.level,
        pet.hunger,
        id
      ]
  );
}

export async function deletePet(id) {
  return await pool.query('DELETE FROM pets WHERE id = ?', [id]);
}


