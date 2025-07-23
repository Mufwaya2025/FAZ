const db = require('../utils/database');

// Get all teams
const getTeams = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM teams');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new team
const createTeam = async (req, res) => {
    const { name, logo_url, league_id, founded_year, stadium } = req.body;

    if (!league_id) {
        return res.status(400).json({ msg: 'League ID is required.' });
    }

    try {
        const newTeam = await db.query(
            'INSERT INTO teams(name, logo_url, league_id, founded_year, stadium) VALUES($1, $2, $3, $4, $5) RETURNING * ',
            [name, logo_url, league_id, founded_year, stadium]
        );
        res.status(201).json(newTeam.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update a team
const updateTeam = async (req, res) => {
    const { id } = req.params;
    const { name, logo_url, league_id, founded_year, stadium } = req.body;
    try {
        const updatedTeam = await db.query(
            'UPDATE teams SET name = $1, logo_url = $2, league_id = $3, founded_year = $4, stadium = $5 WHERE id = $6 RETURNING * ',
            [name, logo_url, league_id, founded_year, stadium, id]
        );
        if (updatedTeam.rows.length === 0) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.json(updatedTeam.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a team
const deleteTeam = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTeam = await db.query('DELETE FROM teams WHERE id = $1 RETURNING * ', [id]);
        if (deletedTeam.rows.length === 0) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.json({ msg: 'Team deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam
};