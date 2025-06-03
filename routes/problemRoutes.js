const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Routes for managing internet problems
router.get('/', problemController.getAllProblems);              // Get all problems (with pagination support)
router.get('/stats', problemController.getProblemStats);        // Get problem statistics
router.get('/:id', problemController.getProblemById);           // Get a single problem by ID
router.post('/', problemController.createProblem);              // Create a new problem report
router.put('/:id/status', problemController.updateProblemStatus); // Update status, priority, etc.

module.exports = router;
