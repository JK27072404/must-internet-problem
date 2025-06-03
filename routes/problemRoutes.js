const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Problem routes
router.get('/', problemController.getAllProblems);
router.get('/stats', problemController.getProblemStats);  // Moved here before /:id
router.get('/:id', problemController.getProblemById);
router.post('/', problemController.createProblem);
router.put('/:id/status', problemController.updateProblemStatus);

module.exports = router;
