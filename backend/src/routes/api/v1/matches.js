const express = require('express');
const matchController = require('../../../controllers/matchController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all matches
router.get('/', matchController.getMatches);

// Get match details by ID
router.get('/:id', matchController.getMatchDetails);

// Create a new match
router.post('/', auth, authorize(['super_admin']), matchController.createMatch);

// Update a match (general details)
router.put('/:id', auth, authorize(['super_admin', 'match_day_operator']), matchController.updateMatchDetails);

// Delete a match
router.delete('/:id', auth, authorize(['super_admin']), matchController.deleteMatch);

// Update live match stats
router.put('/:id/stats', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.updateMatchStats);

// Add a goal scorer to a match
router.post('/:id/goals', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addGoalScorer);

// Get all players for a match
router.get('/:id/players', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.getPlayersForMatch);

// Add a substitution to a match
router.post('/:id/substitutions', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addSubstitution);

// Add a generic match event
router.post('/:id/events', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addMatchEvent);

// Commentary routes
router.post('/:id/commentary', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addCommentary);
router.get('/:id/commentary', matchController.getCommentary);

// Clock management routes
router.post('/:id/start-clock', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.startClock);
router.post('/:id/end-half', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.endHalf);
router.post('/:id/end-match', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.endMatch);

module.exports = router;