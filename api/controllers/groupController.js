import { createGroup, getAllGroups, getGroupById, getGroupMembers, deleteGroup, requestMembership, getPendingRequests, acceptMembership, rejectMembership, getMembership, removeMember, getGroupsForMember, getGroupMovies, addGroupMovie, getGroupMovie, removeGroupMovie, isGroupMember } from '../models/group.js';

const MEDIA_TYPES = ['movie', 'tv'];

// Creates a new group (requires login)
const postGroup = async (req, res) => {
    const groupName = req.body.groupName?.trim();  // Trim deletes empty spaces from start and end
    const ownerId = req.user.id;

    if (!groupName) {
        return res.status(400).json({ error: 'Group name is required' });
    }
    if (groupName.length > 100) {
        return res.status(400).json({ error: "Group name can't be more than 100 characters" });
    }

    try {
        const group = await createGroup(groupName, ownerId);
        return res.status(201).json(group);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'This group name already exists' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Failed to create group' });
    }
};

// Lists all groups (no login required)
const getGroups = async (req, res) => {
    try {
        const groups = await getAllGroups();
        return res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch groups' });
    }
};

const getGroup = async (req, res) => {
    const groupId = Number(req.params.id);

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Everyone can see basic info
        const response = { ...group, isMember: false };

        // Members get full content
        const userId = req.user?.id;
        if (userId) {
            const membership = await getMembership(groupId, userId);
            response.membershipStatus = membership?.status ?? null;

            if (membership?.status === 'accepted') {
                response.isMember = true;
                response.isOwner = group.owner_id === userId;
                response.members = await getGroupMembers(groupId);

                if (response.isOwner) {
                    response.pendingRequests = await getPendingRequests(groupId);
                }
            }
        }


        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch group' });
    }
};

const removeGroup = async (req, res) => {
    const groupId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.owner_id !== userId) {
            return res.status(403).json({ error: 'Only the owner can delete this group' });
        }

        await deleteGroup(groupId, userId);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete group' });
    }
};

// Sends a join request
const postJoinRequest = async (req, res) => {
    const groupId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const existing = await getMembership(groupId, userId);

        if (existing?.status === 'accepted') {
            return res.status(409).json({ error: 'You are already a member' });
        }
        if (existing?.status === 'pending') {
            return res.status(409).json({ error: 'You already have a pending request' });
        }

        const request = await requestMembership(groupId, userId);
        return res.status(201).json(request);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send join request' });
    }
};

// Accept or reject join request
const handleJoinRequest = async (req, res) => {
    const groupId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const { action } = req.body;

    if (!Number.isInteger(groupId) || !Number.isInteger(targetUserId)) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    if (action !== 'accept' && action !== 'reject') {
        return res.status(400).json({ error: "Action must be 'accept' or 'reject'" });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        if (group.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the owner can handle join requests' });
        }

        const handled = action === 'accept'
            ? await acceptMembership(groupId, targetUserId)
            : await rejectMembership(groupId, targetUserId);

        if (!handled) {
            return res.status(404).json({ error: 'Pending request not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to handle join request' });
    }
};

// Owner removes a member, or a member leaves
const removeGroupMember = async (req, res) => {
    const groupId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const userId = req.user.id;

    if (!Number.isInteger(groupId) || !Number.isInteger(targetUserId)) {
        return res.status(400).json({ error: 'Invalid id' });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const isOwner = group.owner_id === userId;
        const isSelf = targetUserId === userId;

        if (!isOwner && !isSelf) {
            return res.status(403).json({ error: 'You can only remove yourself' });
        }

        if (targetUserId === group.owner_id) {
            return res.status(403).json({ error: 'The owner cannot be removed; delete the group instead' });
        }

        const removed = await removeMember(groupId, targetUserId);

        if (!removed) {
            return res.status(404).json({ error: 'Member not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to remove member' });
    }
};

// Lists groups where the logged-in user is an accepted member
const getMyGroups = async (req, res) => {
    try {
        const groups = await getGroupsForMember(req.user.id);
        return res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch your groups' });
    }
};

// Lists movies added to a group (members only)
const getMoviesOfGroup = async (req, res) => {
    const groupId = Number(req.params.id);

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        if (!(await isGroupMember(groupId, req.user.id))) {
            return res.status(403).json({ error: 'Only group members can view group movies' });
        }

        const movies = await getGroupMovies(groupId);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch group movies' });
    }
};

// Adds a searched movie or TV show to a group (members only)
const postGroupMovie = async (req, res) => {
    const groupId = Number(req.params.id);
    const { movieId, mediaType, posterPath } = req.body;
    const title = req.body.title?.trim();

    if (!Number.isInteger(groupId)) {
        return res.status(400).json({ error: 'Invalid group id' });
    }
    if (!Number.isInteger(movieId)) {
        return res.status(400).json({ error: 'movieId must be an integer' });
    }
    if (!MEDIA_TYPES.includes(mediaType)) {
        return res.status(400).json({ error: "mediaType must be 'movie' or 'tv'" });
    }
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > 255) {
        return res.status(400).json({ error: "Title can't be more than 255 characters" });
    }

    try {
        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        if (!(await isGroupMember(groupId, req.user.id))) {
            return res.status(403).json({ error: 'Only group members can add movies' });
        }

        const movie = await addGroupMovie(groupId, movieId, mediaType, title, posterPath ?? null, req.user.id);
        return res.status(201).json(movie);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'This title is already in the group' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Failed to add movie to group' });
    }
};

// Removes a movie or TV show from a group (the member who added it, or the owner)
const removeMovieFromGroup = async (req, res) => {
    const groupId = Number(req.params.id);
    const movieId = Number(req.params.movieId);
    const { mediaType } = req.params;
    const userId = req.user.id;

    if (!Number.isInteger(groupId) || !Number.isInteger(movieId)) {
        return res.status(400).json({ error: 'Invalid id' });
    }
    if (!MEDIA_TYPES.includes(mediaType)) {
        return res.status(400).json({ error: "mediaType must be 'movie' or 'tv'" });
    }

    try {
        const movie = await getGroupMovie(groupId, mediaType, movieId);

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found in this group' });
        }

        const group = await getGroupById(groupId);
        const isOwner = group.owner_id === userId;
        const isAdder = movie.added_by === userId;

        if (!isOwner && !isAdder) {
            return res.status(403).json({ error: 'Only the owner or the member who added the movie can remove it' });
        }

        await removeGroupMovie(groupId, mediaType, movieId);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to remove movie from group' });
    }
};

export { postGroup, getGroups, getGroup, removeGroup, postJoinRequest, handleJoinRequest, removeGroupMember, getMyGroups, getMoviesOfGroup, postGroupMovie, removeMovieFromGroup };