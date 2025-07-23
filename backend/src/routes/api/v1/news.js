const express = require('express');
const newsController = require('../../../controllers/newsController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all news
router.get('/', newsController.getNews);

// Create a new news article
router.post('/', auth, authorize(['match_day_operator', 'super_admin', 'editor']), newsController.createNews);

// Update a news article
router.put('/:id', auth, authorize(['match_day_operator', 'super_admin', 'editor']), newsController.updateNews);

// Delete a news article
router.delete('/:id', auth, authorize(['match_day_operator', 'super_admin', 'editor']), newsController.deleteNews);

// Approve a news article (Super Admin only)
router.put('/:id/approve', auth, authorize(['super_admin']), newsController.approveNews);

// Request news edit (Super Admin only)
router.put('/:id/request-edit', auth, authorize(['super_admin']), newsController.requestNewsEdit);

module.exports = router;