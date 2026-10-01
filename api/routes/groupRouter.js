import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { postGroup, getGroups, getGroup, removeGroup, postJoinRequest, handleJoinRequest, removeGroupMember } from '../controllers/groupController.js';

const router = express.Router();

// Creates a new group (requires login)
router.post('/', authenticateToken, postGroup);

// List all groups (open to everyone)
router.get('/', getGroups);

// Gets a spesific group, content depends on membership
router.get('/:id', optionalAuth, getGroup);

// Deletes the group 
router.delete('/:id', authenticateToken, removeGroup);

// Sends a join request (requires login)
router.post('/:id/requests', authenticateToken, postJoinRequest);

// Accepts or rejects a join request (owner only)
router.put('/:id/requests/:userId', authenticateToken, handleJoinRequest);

// Removes a member (owner) or leaves the group (member)
router.delete('/:id/members/:userId', authenticateToken, removeGroupMember);

export default router;