import { createGroup, getAllGroups, getGroupById, isGroupMember, getGroupMembers, deleteGroup, requestMembership, getPendingRequests, acceptMembership, rejectMembership, getMembership, removeMember } from '../models/group.js';

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

export { postGroup, getGroups, getGroup, removeGroup, postJoinRequest, handleJoinRequest, removeGroupMember };