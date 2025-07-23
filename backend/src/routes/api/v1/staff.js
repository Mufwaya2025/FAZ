const express = require('express');
const staffController = require('../../../controllers/staffController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all staff
router.get('/', auth, authorize(['super_admin']), staffController.getStaff);

// Create new staff
router.post('/', auth, authorize(['super_admin']), staffController.createStaff);

// Update staff
router.put('/:id', auth, authorize(['super_admin']), staffController.updateStaff);

// Delete staff
router.delete('/:id', auth, authorize(['super_admin']), staffController.deleteStaff);

module.exports = router;