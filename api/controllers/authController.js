
import express from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/user.js';

export const register = async (req, res) => {
    const { email, password} = req.body;

    try {
        if ( !email || !password){
            return res.status(400).json({ message: 'All fields are required' });
        }

        //Checks that the email is not already used
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check that the password is at least 8 characters long and uses both numbers and letters
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and it must contain numbers and letters"})
        }
    
        //Hashes the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Creates the new user
        const newUser = await createUser(email, hashedPassword);
        return res.status(201).json({ message: 'User registered successfully', user: newUser});
    
    } catch (err) {
        return res.status(500).json({ message: 'Server error'});
    };

}
