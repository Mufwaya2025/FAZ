const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController');
const { auth, authorize } = require('../../../middleware/auth');

// @route   POST api/v1/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST api/v1/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET api/v1/users
// @desc    Get all users
// @access  Private (Super Admin)
router.get('/', auth, authorize(['super_admin', 'match_day_operator']), userController.getUsers);

// @route   PUT api/v1/users/:id/role
// @desc    Update user role
// @access  Private (Super Admin)
router.put('/:id/role', auth, authorize(['super_admin']), userController.updateUserRole);

// @route   PUT api/v1/users/:id
// @desc    Update user details
// @access  Private (Super Admin)
router.put('/:id', auth, authorize(['super_admin']), userController.updateUser);

// @route   DELETE api/v1/users/:id
// @desc    Delete a user
// @access  Private (Super Admin)
router.delete('/:id', auth, authorize(['super_admin']), userController.deleteUser);

// @route   GET api/v1/users/verifyToken
// @desc    Verify user token
// @access  Private
router.get('/verifyToken', auth, (req, res) => {
    res.status(200).json({ msg: 'Token is valid' });
});

module.exports = router;
