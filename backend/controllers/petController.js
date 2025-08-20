import * as petService from "../services/petService.js";
import * as userService from "../services/userService.js";
import Pet from "../models/pet.js";

export async function findPetByUserId(req, res) {
    try {
        const {userId} = req.params;
        const userResult = await userService.findUserById(userId);

        if (userResult.length === 0) {
            res.status(404);
            return res.status(404).send({error: "User does not exist."})
        }

        const user = userResult[0];
        if (user.petId === null) {
            return res.status(404).send({error: "User does not have pet."});
        }
        console.log(user.petId, typeof(user.petId));
        const petResult = await petService.findPetById(user.petId);
        console.log(petResult);

        if (petResult.length === 1) {
            return res.status(200).send(petResult);
        } else if (petResult.length === 0) {
            return res.status(404).send({error: "Pet does not exist."})
        }
    } catch (err) {
        console.error('findPetByUserId failed:', err);
        return res.status(500).json({error: 'Server error'});
    }
}

export async function createPet(req, res) {
    try {
        const {pet} = req.body;

        // Check if pet was provided in request body
        if (!pet) {
            return res.status(400).json({message: `No object 'pet' provided in request body`});
        }

        // Check if user already has a pet
        const userResult = await userService.findUserById(req.params.userId);

        if (userResult.length === 0) {
            return res.status(400).send({error: "User does not exist."})
        }
        const existingUserPetId = userResult[0].petId;
        if (existingUserPetId != null) {
            return res.status(409).send({error: "User already has a pet."})
        }

        const result = await petService.createPet(pet);

        const newUserResult = await userService.updateUser(req.params.userId, {petId: result.insertId})

        // Optionally re-fetch the created pet
        const fetchedPet = await petService.findPetById(result.insertId);
        return res.status(201).send({
            message: 'Pet created successfully',
            task: fetchedPet[0],
        });
    } catch (err) {
        console.error('Create error:', err);
        return res.status(500).json({error: 'Internal server error'});
    }
}

export async function updatePet(req, res) {
    try {
        const {pet} = req.body;

        // Check if pet was provided in request body
        if (!pet) {
            return res.status(400).json({message: `No object 'pet' provided in request body`});
        }

        // Check if user already has pet
        const {userId} = req.params;
        const userResult = await userService.findUserById(userId);
        console.log("find user by ID ######", userResult[0]);

        if (userResult.length === 0) {
            res.status(404);
            return res.status(404).send({error: "User does not exist."})
        }

        const user = userResult[0];
        if (user.petId === null) {
            return res.status(404).send({error: "User does not have pet."});
        }

        const existingPet = await petService.findPetById(user.petId);
        const updatedPet = new Pet(
            pet.name || existingPet.name,
            pet.mood || existingPet.mood,
            pet.personality || existingPet.personality,
            pet.level || existingPet.level,
            pet.hunger || existingPet.hunger
        )

        const result = await petService.updatePet(user.petId, updatedPet);

        // Optionally re-fetch the updated pet
        const fetchedPet = await petService.findPetById(user.petId);
        console.log("fetched pet", fetchedPet[0]);
        return res.status(200).send({
            message: 'Pet updated successfully',
            pet: fetchedPet[0]
        });
    } catch (err) {
        console.error('Create error:', err);
        return res.status(500).json({message: 'Internal server error', error: err.message});
    }
}

export async function deletePet(req, res) {
    try {
        // Check if user has pet
        const {userId} = req.params;
        const userResult = await userService.findUserById(userId);

        if (userResult.length === 0) {
            res.status(404);
            return res.status(404).send({error: "User does not exist."})
        }

        const user = userResult[0];
        if (user.petId === null) {
            return res.status(404).send({error: "User does not have pet."});
        }

        const existingPet = await petService.findPetById(user.petId);

        // TODO: Update user
        const updatedUserResult = await userService.updateUser(userId, {petId: null});
        const result = await petService.deletePet(existingPet[0].id);

        return res.status(200).send({
            message: 'Pet deleted successfully',
        });
    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({error: 'Internal server error'});
    }
}
