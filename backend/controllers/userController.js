import User from "../models/user.js";
import * as userService from "../services/userService.js";
import bcrypt from "bcrypt";


export async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }
    return res.status(200).json(users);
  } catch (err) {
    console.error('getAllUsers failed:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function signUp(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await userService.createUser(username, email, password);

    if (user) {
      return res.status(201).json({ message: 'User created successfully', user });
    } else {
      return res.status(409).json({ error: 'User already exists' });
    }
  } catch (err) {
    console.error('Signup failed:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}

export async function findUser(req, res) {
  try {
    const {email, password} = req.body;
    const result = await userService.findUserByEmail(email);
    if(result.length > 0) {
        bcrypt.compare(
          password,
          result[0].password,
          function (err, compResult) {
            if (compResult) {
              res.status(200).send(result);
            } else {
              res.status(401).send({ error: "Incorrect password" });
            }
          }
        );
      } else {
        res.status(404).send({ error: "Incorrect user" });
      }
  } catch (err) {
    res.status(500).send({message:"Internal Server Error", error: err.message});
  }
}

export async function findUserById(req, res) {
  try {
    const {userId} = req.params;
    const result = await userService.findUserById(userId);
    if (result.length === 1) {
      return res.status(200).send(result);
    } else if (result.length === 0) {
      return res.status(404).send({error: "User does not exist."});
    }

  } catch (err) {
    return res.status(500).send({message: "Internal Server Error", error: err.message});
  }
}

export async function updateEmailById(req, res) {
  const { userId } = req.params;
  const { newEmail } = req.body;
  try {
    // Check if the email is occupied
    const existing = await userService.findUserByEmail(newEmail);

    if (existing.length!==0 && existing.id !== parseInt(userId)) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const result = await userService.updateUserById(userId, 'email', newEmail);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function findEmailById(req, res) {
  const { userId } = req.params;
  try {
    const email = await userService.getUserById(userId, 'email');
    return res.status(200).send({ email });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function updatePasswordById(req, res) {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const storedPassword = await userService.getUserById(userId, 'password');
    bcrypt.compare(oldPassword, storedPassword, async function (err, verified) {
      if (err) {
        console.error('bcrypt error:', err);
        return res.status(500).send({ message: 'Server error during password check' });
      }

      if (!verified) {
        return res.status(401).send({ message: 'Old password does not match' });
      }

      // If verified
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const result = await userService.updateUserById(userId, 'password', hashedNewPassword);
      return res.status(200).send(result);
      });
    } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function findPasswordById(req, res) {
  const { userId } = req.params;
  try {
    const password = await userService.getUserById(userId, 'password');
    return res.status(200).send({ password });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function updateUsernameById(req, res) {
  const { userId } = req.params;
  const { newUsername } = req.body;
  try {
    const result = await userService.updateUserById(userId, 'username', newUsername);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function findUsernameById(req, res) {
  const { userId } = req.params;
  try {
    const username = await userService.getUserById(userId, 'username');
    return res.status(200).send({ username });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function findProfileImageById(req, res) {
  const { userId } = req.params;
  try {
    const profileImage = await userService.getUserById(userId, 'profileImage');
    return res.status(200).send({ profileImage });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { newEmail, newPassword, newUsername, newPetId } = req.body;

    // Get current user from DB, to update the changed fields only
    const currentUser = await userService.findUserById(userId);
    if (!currentUser || currentUser.length === 0) {
      return res.status(404).send({ error: 'User does not exist' });
    }

    const existingUser = currentUser[0];

    const updatedFields = {
      email: newEmail || existingUser.email,
      password: newPassword || existingUser.password,
      username: newUsername || existingUser.username,
      petId: newPetId || existingUser.petId,
    };

    if (newPassword) {
      updatedFields.password = await bcrypt.hash(newPassword, 10);
    }

    const result = await userService.updateUser(userId, updatedFields);

    // Optionally re-fetch the updated user
    const updatedUser = await userService.findUserById(userId);
    return res.status(200).send({
      message: 'User updated successfully',
      user: updatedUser[0],
    });

  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await userService.deleteUser(userId);

    // Deletion failed
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User does not exist' });
    }

    // Deletion succeed
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
