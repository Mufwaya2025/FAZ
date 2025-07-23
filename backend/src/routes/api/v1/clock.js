const express = require('express');
const clockController = require('../../../controllers/clockController');
const { auth, authorize } = require('../../../middleware/auth');

module.exports = (io) => {
    const router = express.Router();

    router.post('/:id/start-clock', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => clockController.startClock(req, res, io));
    router.post('/:id/end-half', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => clockController.endHalf(req, res, io));
    router.post('/:id/end-match', auth, authorize(['super_admin', 'match_day_operator', 'editor']), (req, res) => clockController.endMatch(req, res, io));

    return router;
};