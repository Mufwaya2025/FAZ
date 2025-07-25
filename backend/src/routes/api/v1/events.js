const express = require('express');
const eventController = require('../../../controllers/eventController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Undo a match event
router.get('/', eventController.getMatchEvents);
router.delete('/:id', auth, authorize(['super_admin', 'match_day_operator', 'editor']), eventController.undoMatchEvent);

module.exports = router;
