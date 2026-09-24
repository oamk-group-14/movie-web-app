import { deleteUserById } from '../models/user.js';

// Deletes the logged in user's account. User id comes from the token.
export const deleteMe = async (req, res) => {
    try {
        const deletedCount = await deleteUserById(req.user.id);

        if (deletedCount === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(204).send();

    } catch (error) {
        console.error('Delete account error:', error);

        res.status(500).json({
            error: 'An error occurred on the server'
        });
    }
};