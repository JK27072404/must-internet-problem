const pool = require('../config/db');

// Get all problems (with pagination)
exports.getAllProblems = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM problems ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single problem by ID
exports.getProblemById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM problems WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new problem
exports.createProblem = async (req, res) => {
    const { title, description, location, priority, status = 'Pending' } = req.body;
    
    if (!title || !description || !location || !priority) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (title.length > 100) {
        return res.status(400).json({ error: 'Title is too long (max 100 characters)' });
    }

    if (description.length > 1000) {
        return res.status(400).json({ error: 'Description is too long (max 1000 characters)' });
    }
    
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority level' });
    }
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO problems (title, description, location, priority, status) VALUES (?, ?, ?, ?, ?)',
            [title, description, location, priority, status]
        );

        const [rows] = await pool.query('SELECT * FROM problems WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update problem status or other fields
exports.updateProblemStatus = async (req, res) => {
    const { status, priority, description, location } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    // Build dynamic fields for update
    const updates = [];
    const values = [];

    if (status) {
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        updates.push('status = ?');
        values.push(status);
    }

    if (priority) {
        const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority' });
        }
        updates.push('priority = ?');
        values.push(priority);
    }

    if (description) {
        updates.push('description = ?');
        values.push(description);
    }

    if (location) {
        updates.push('location = ?');
        values.push(location);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields provided to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    try {
        const [result] = await pool.query(
            `UPDATE problems SET ${updates.join(', ')} WHERE id = ?`,
            [...values, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const [rows] = await pool.query('SELECT * FROM problems WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get problem statistics (dynamic computation)
exports.getProblemStats = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                COUNT(*) AS total,
                SUM(status = 'Pending') AS pending,
                SUM(status = 'In Progress') AS inProgress,
                SUM(status = 'Resolved') AS resolved
            FROM problems
        `);

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching problem stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
