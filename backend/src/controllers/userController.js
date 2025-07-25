const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/database');

// Register a new user
const registerUser = async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user into database
        const newUser = await db.query(
            'INSERT INTO users(email, password_hash, name, role) VALUES($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, password_hash, name, role || 'user'] // Default role to 'user'
        );

        // Generate JWT token
        const payload = {
            user: {
                id: newUser.rows[0].id,
                role: newUser.rows[0].role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: newUser.rows[0] });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: user.rows[0] });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, email, name, role FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const result = await db.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const params = [];
        let queryParts = [];
        let paramIndex = 1;

        if (name) {
            queryParts.push(`name = ${paramIndex}`);
            params.push(name);
            paramIndex++;
        }
        if (email) {
            queryParts.push(`email = ${paramIndex}`);
            params.push(email);
            paramIndex++;
        }
        if (role) {
            queryParts.push(`role = ${paramIndex}`);
            params.push(role);
            paramIndex++;
        }

        if (queryParts.length === 0) {
            return res.status(400).json({ msg: 'No fields provided for update' });
        }

        let query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ${paramIndex} RETURNING id, email, name, role`;
        params.push(id);

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    updateUserRole,
    deleteUser,
    updateUser
};