import { pool } from './db.js'

// Create a group and add the creator as an accepted member
const createGroup = async (groupName, ownerId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupResult = await client.query(
      `INSERT INTO Groups (group_name, owner_id)
       VALUES ($1, $2)
       RETURNING group_id, group_name, owner_id`,
      [groupName, ownerId]
    );
    const group = groupResult.rows[0];

    await client.query(
      `INSERT INTO Group_Members (group_id, user_id, status)
       VALUES ($1, $2, 'accepted')`,
      [group.group_id, ownerId]
    );

    await client.query('COMMIT');
    return group;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// List all groups, newest first (visible to everyone)
const getAllGroups = async () => {
  const result = await pool.query(
    `SELECT g.group_id, g.group_name, g.owner_id, u.email AS owner_email
     FROM Groups g
     JOIN Users u ON u.user_id = g.owner_id
     ORDER BY g.group_id DESC`
  );
  return result.rows;
};

// Get specific group's info
const getGroupById = async (groupId) => {
  const result = await pool.query(
    `SELECT g.group_id, g.group_name, g.owner_id, u.email AS owner_email
     FROM Groups g
     JOIN Users u ON u.user_id = g.owner_id
     WHERE g.group_id = $1`,
    [groupId]
  );
  return result.rows[0];
};

// Check whether a user is an accepted member of the group
const isGroupMember = async (groupId, userId) => {
  const result = await pool.query(
    `SELECT 1
     FROM Group_Members
     WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
    [groupId, userId]
  );
  return result.rowCount > 0;
};

// Get accepted members of a group
const getGroupMembers = async (groupId) => {
  const result = await pool.query(
    `SELECT u.user_id, u.email
     FROM Group_Members gm
     JOIN Users u ON u.user_id = gm.user_id
     WHERE gm.group_id = $1 AND gm.status = 'accepted'
     ORDER BY u.email`,
    [groupId]
  );
  return result.rows;
};

// Delete a group (only if the user is the owner)
const deleteGroup = async (groupId, userId) => {
  const result = await pool.query(
    `DELETE FROM Groups
     WHERE group_id = $1 AND owner_id = $2`,
    [groupId, userId]
  );
  return result.rowCount > 0;
};

// Send a join request (default status is 'pending')
const requestMembership = async (groupId, userId) => {
  const result = await pool.query(
    `INSERT INTO Group_Members (group_id, user_id)
     VALUES ($1, $2)
     RETURNING group_id, user_id, status`,
    [groupId, userId]
  );
  return result.rows[0];
};

// Get pending join requests for a group
const getPendingRequests = async (groupId) => {
  const result = await pool.query(
    `SELECT u.user_id, u.email
     FROM Group_Members gm
     JOIN Users u ON u.user_id = gm.user_id
     WHERE gm.group_id = $1 AND gm.status = 'pending'
     ORDER BY u.email`,
    [groupId]
  );
  return result.rows;
};

// Accept a pending request
const acceptMembership = async (groupId, userId) => {
  const result = await pool.query(
    `UPDATE Group_Members
     SET status = 'accepted'
     WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,
    [groupId, userId]
  );
  return result.rowCount > 0;
};

// Reject a request by removing the row
const rejectMembership = async (groupId, userId) => {
  const result = await pool.query(
    `DELETE FROM Group_Members
     WHERE group_id = $1 AND user_id = $2 AND status = 'pending'`,
    [groupId, userId]
  );
  return result.rowCount > 0;
};

// Get a user's membership row, whatever its status
const getMembership = async (groupId, userId) => {
  const result = await pool.query(
    `SELECT status
     FROM Group_Members
     WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return result.rows[0];
};

// Remove an accepted member from a group
const removeMember = async (groupId, userId) => {
  const result = await pool.query(
    `DELETE FROM Group_Members
     WHERE group_id = $1 AND user_id = $2 AND status = 'accepted'`,
    [groupId, userId]
  );
  return result.rowCount > 0;
};

export { createGroup, getAllGroups, getGroupById, isGroupMember, getGroupMembers, deleteGroup, requestMembership, getPendingRequests, acceptMembership, rejectMembership, getMembership, removeMember };