const express = require('express');
const leagueController = require('../../../controllers/leagueController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all leagues (accessible to all authenticated users)
router.get('/', auth, leagueController.getLeagues);

// Create a new league (accessible only to super_admin)
router.post('/', auth, authorize(['super_admin']), leagueController.createLeague);

// Update a league (accessible only to super_admin)
router.put('/:id', auth, authorize(['super_admin']), leagueController.updateLeague);

// Delete a league (accessible only to super_admin)
router.delete('/:id', auth, authorize(['super_admin']), leagueController.deleteLeague);

module.exports = router;