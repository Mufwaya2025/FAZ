const express = require('express');
const router = express.Router();
const { getCountries, getSeasons } = require('../../controllers/dataController');

// @route   GET api/v1/data/countries
// @desc    Get all countries
// @access  Public
router.get('/countries', getCountries);

// @route   GET api/v1/data/seasons
// @desc    Get all seasons
// @access  Public
router.get('/seasons', getSeasons);

module.exports = router;
