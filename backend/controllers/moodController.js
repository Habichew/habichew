import * as moodService from "../services/moodService.js";
import * as userService from "../services/userService.js";

export async function getAllMoodTypes(req, res) {
  try {
    const moods = await moodService.getAllMoodTypes();
    if (!moods || moods.length === 0) {
      return res.status(404).json({ message: 'No mood found.' });
    }
    res.status(200).json(moods);
  } catch (err) {
    console.error('getAllMoodTypes failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
}


export async function insertMoodLog(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await moodService.logMood(username, email, password);

    if (user) {
      res.status(201).json({ message: 'User created successfully', user });
    } else {
      res.status(409).json({ error: 'User already exists' });
    }
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getMoodLogs(req, res) {
    try {
      const {userId} = req.params;
      const logs = await moodService.getMoodLogsByUser(userId);
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch mood logs', error: err.message });
    }
}

export async function upsertMoodLog(req, res) {
  try {
    const { moodDate, moodTypeId, note } = req.body;
    const { userId } = req.params;

    if (!userId || !moodDate) {
      return res.status(400).json({ message: 'User id and mood log date are required.' });
    }

    if (!note) {
      const note = await moodService.getMoodLogsByUser(userId);
    }

    const logs = await moodService.upsertMoodLog(userId, moodDate, moodTypeId, note);
    res.status(200).json({ message: 'Update mood logs successfully.', logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update mood logs', error: err.message });
  }
}

export async function deleteMoodLog(req, res) {

  try {
    const { moodDate } = req.body;
    const { userId } = req.params;

    const userCheck = await userService.findUserById(userId);
    if (userCheck.length===0) {
      return res.status(404).json({ message: 'No user found.' });
    }

    const logs = await moodService.deleteMoodLog(userId, moodDate);

    // Deletion succeed
    return res.status(200).json({ message: 'The mood log is deleted' , logs });
  } catch (err) {
    return res.status(500).json({ message: 'Deletion error: ', error: err.message });
  }
}
