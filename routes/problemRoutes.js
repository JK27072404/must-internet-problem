const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Problem routes
router.get('/', problemController.getAllProblems);
router.get('/:id', problemController.getProblemById);
router.post('/', problemController.createProblem);
router.put('/:id/status', problemController.updateProblemStatus);
router.get('/stats', problemController.getProblemStats);

module.exports = router;