import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import { postGroup, getGroups, getGroup, removeGroup, postJoinRequest, handleJoinRequest, removeGroupMember, getMyGroups, getMoviesOfGroup, postGroupMovie, removeMovieFromGroup } from '../controllers/groupController.js';

const router = express.Router();

// Creates a new group (requires login)
router.post('/', authenticateToken, postGroup);

// List all groups (open to everyone)
router.get('/', getGroups);

// Lists groups where the logged-in user is a member
// Must be defined before '/:id', otherwise 'mine' is treated as a group id
router.get('/mine', authenticateToken, getMyGroups);

// Gets a specific group, content depends on membership
router.get('/:id', optionalAuth, getGroup);

// Deletes the group 
router.delete('/:id', authenticateToken, removeGroup);

// Sends a join request (requires login)
router.post('/:id/requests', authenticateToken, postJoinRequest);

// Accepts or rejects a join request (owner only)
router.put('/:id/requests/:userId', authenticateToken, handleJoinRequest);

// Removes a member (owner) or leaves the group (member)
router.delete('/:id/members/:userId', authenticateToken, removeGroupMember);

// Lists movies added to the group (members only)
router.get('/:id/movies', authenticateToken, getMoviesOfGroup);

// Adds a movie to the group (members only)
router.post('/:id/movies', authenticateToken, postGroupMovie);

// Removes a movie or TV show from the group (the member who added it, or the owner)
router.delete('/:id/movies/:mediaType/:movieId', authenticateToken, removeMovieFromGroup);

export default router;