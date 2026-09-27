import { createGroup, getAllGroups, getGroupById, isGroupMember, getGroupMembers, deleteGroup } from '../models/group.js';

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
        if (userId && await isGroupMember(groupId, userId)) {
            response.isMember = true;
            response.isOwner = group.owner_id === userId;
            response.members = await getGroupMembers(groupId);
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

export { postGroup, getGroups, getGroup, removeGroup };