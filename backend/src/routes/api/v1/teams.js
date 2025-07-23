const express = require('express');
const teamController = require('../../../controllers/teamController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', teamController.getTeams);

// Create a new team
router.post('/', auth, authorize(['super_admin']), teamController.createTeam);

// Update a team
router.put('/:id', auth, authorize(['super_admin']), teamController.updateTeam);

// Delete a team
router.delete('/:id', auth, authorize(['super_admin']), teamController.deleteTeam);

module.exports = router;
