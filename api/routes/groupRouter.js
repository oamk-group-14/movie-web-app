import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { postGroup, getGroups, getGroup, removeGroup } from '../controllers/groupController.js';

const router = express.Router();

// Creates a new group (requires login)
router.post('/', authenticateToken, postGroup);

// List all groups (open to everyone)
router.get('/', getGroups);

// Gets a spesific group, content depends on membership
router.get('/:id', optionalAuth, getGroup);

// Deletes the group 
router.delete('/:id', authenticateToken, removeGroup);

export default router;