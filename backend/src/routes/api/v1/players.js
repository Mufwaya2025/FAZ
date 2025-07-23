const express = require('express');
const playerController = require('../../../controllers/playerController');
const { auth, authorize } = require('../../../middleware/auth');

const router = express.Router();

// Get all players
router.get('/', playerController.getPlayers);

// Create a new player
router.post('/', auth, authorize(['super_admin']), playerController.createPlayer);

// Update a player
router.put('/:id', auth, authorize(['super_admin']), playerController.updatePlayer);

// Delete a player
router.delete('/:id', auth, authorize(['super_admin']), playerController.deletePlayer);

module.exports = router;