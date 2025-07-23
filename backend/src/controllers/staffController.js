const db = require('../utils/database');

// Get all staff
const getStaff = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, team_id, role, nationality, image_url FROM staff');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create new staff
const createStaff = async (req, res) => {
    const { name, team_id, role, nationality, image_url } = req.body;
    try {
        const newStaff = await db.query(
            'INSERT INTO staff(name, team_id, role, nationality, image_url) VALUES($1, $2, $3, $4, $5) RETURNING id, name, team_id, role, nationality, image_url ',
            [name, team_id, role, nationality, image_url]
        );
        res.status(201).json(newStaff.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update staff
const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, team_id, role, nationality, image_url } = req.body;
    try {
        const updatedStaff = await db.query(
            'UPDATE staff SET name = $1, team_id = $2, role = $3, nationality = $4, image_url = $5 WHERE id = $6 RETURNING id, name, team_id, role, nationality, image_url ',
            [name, team_id, role, nationality, image_url, id]
        );
        if (updatedStaff.rows.length === 0) {
            return res.status(404).json({ msg: 'Staff not found' });
        }
        res.json(updatedStaff.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete staff
const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStaff = await db.query('DELETE FROM staff WHERE id = $1 RETURNING * ', [id]);
        if (deletedStaff.rows.length === 0) {
            return res.status(404).json({ msg: 'Staff not found' });
        }
        res.json({ msg: 'Staff deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff
};