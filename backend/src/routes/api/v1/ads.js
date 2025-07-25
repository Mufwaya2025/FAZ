const express = require('express');
const adsController = require('../../../controllers/adsController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize(['super_admin', 'editor', 'match_day_operator', 'user']), adsController.getAds);
router.post('/script', auth, authorize(['super_admin', 'editor']), adsController.createAdScript);
router.delete('/clear-all', auth, authorize(['super_admin', 'editor']), adsController.clearAllAds);

module.exports = router;
