const db = require('../utils/database');

// Get all leagues
const getLeagues = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM leagues');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new league
const createLeague = async (req, res) => {
    const { name, country, season } = req.body;
    try {
        const newLeague = await db.query(
            'INSERT INTO leagues(name, country, season) VALUES($1, $2, $3) RETURNING * ',
            [name, country, season]
        );
        res.status(201).json(newLeague.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a league
const updateLeague = async (req, res) => {
    const { id } = req.params;
    const { name, country, season } = req.body;
    try {
        const updatedLeague = await db.query(
            'UPDATE leagues SET name = $1, country = $2, season = $3 WHERE id = $4 RETURNING * ',
            [name, country, season, id]
        );
        if (updatedLeague.rows.length === 0) {
            return res.status(404).json({ msg: 'League not found' });
        }
        res.json(updatedLeague.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a league
const deleteLeague = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedLeague = await db.query('DELETE FROM leagues WHERE id = $1 RETURNING * ', [id]);
        if (deletedLeague.rows.length === 0) {
            return res.status(404).json({ msg: 'League not found' });
        }
        res.json({ msg: 'League deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getLeagues,
    createLeague,
    updateLeague,
    deleteLeague
};