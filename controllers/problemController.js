const pool = require('../config/db');

// Get all problems
exports.getAllProblems = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM problems ORDER BY created_at DESC');
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

        // Optional: fetch the newly created problem from DB to get accurate timestamps
        const [rows] = await pool.query('SELECT * FROM problems WHERE id = ?', [result.insertId]);

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update problem status
exports.updateProblemStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE problems SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Return updated problem data after update
        const [rows] = await pool.query('SELECT * FROM problems WHERE id = ?', [req.params.id]);

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating problem status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get problem statistics
exports.getProblemStats = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM problem_stats');
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No statistics found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching problem stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
