const express = require('express');
const matchController = require('../../../controllers/matchController');
const { auth, authorize } = require('../../../middleware/auth');

module.exports = (io) => {
    const router = express.Router();

    // Get all matches
    router.get('/', matchController.getMatches);

    // Get match details by ID
    router.get('/:id', matchController.getMatchDetails);

    // Create a new match
    router.post('/', auth, authorize(['super_admin']), matchController.createMatch);

    // Update a match (general details)
    router.put('/:id', auth, authorize(['super_admin', 'match_day_operator']), (req, res) => matchController.updateMatchDetails(req, res, io));

    // Delete a match
    router.delete('/:id', auth, authorize(['super_admin']), matchController.deleteMatch);

    // Update live match stats
    router.put('/:id/stats', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.updateMatchStats(req, res, io));

    // Add a goal scorer to a match
    router.post('/:id/goals', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.addGoalScorer(req, res, io));

    // Get all players for a match
    router.get('/:id/players', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.getPlayersForMatch);

    // Add a substitution to a match
    router.post('/:id/substitutions', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.addSubstitution(req, res, io));

    // Add a generic match event
router.post('/:id/events', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addMatchEvent);

// Commentary routes
router.post('/:id/commentary', auth, authorize(['super_admin', 'match_day_operator', 'editor']), matchController.addCommentary);
router.get('/:id/commentary', matchController.getCommentary);

module.exports = router;

    // Commentary routes
    router.post('/:id/commentary', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.addCommentary(req, res, io));
    router.get('/:id/commentary', matchController.getCommentary);

    // Clock management routes
    router.post('/:id/start-clock', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.startClock(req, res, io));
    router.post('/:id/end-half', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.endHalf(req, res, io));
    router.post('/:id/end-match', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => matchController.endMatch(req, res, io));

    return router;
};