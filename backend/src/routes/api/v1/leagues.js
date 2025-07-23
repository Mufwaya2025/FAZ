const express = require('express');
const leagueController = require('../../../controllers/leagueController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all leagues (publicly accessible)
router.get('/', leagueController.getLeagues);

// Create a new league (accessible only to super_admin)
router.post('/', auth, authorize(['super_admin']), leagueController.createLeague);

// Update a league (accessible only to super_admin)
router.put('/:id', auth, authorize(['super_admin']), leagueController.updateLeague);

// Delete a league (accessible only to super_admin)
router.delete('/:id', auth, authorize(['super_admin']), leagueController.deleteLeague);

// Get league standings (publicly accessible)
router.get('/:id/standings', leagueController.getLeagueStandings);

module.exports = router;