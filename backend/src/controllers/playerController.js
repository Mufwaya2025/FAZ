const db = require('../utils/database');

// Get all players
const getPlayers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, team_id, position, jersey_number, age, nationality, image_url FROM players');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new player
const createPlayer = async (req, res) => {
    const { name, team_id, position, jersey_number, age, nationality, image_url } = req.body;
    try {
        const newPlayer = await db.query(
            'INSERT INTO players(name, team_id, position, jersey_number, age, nationality, image_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, team_id, position, jersey_number, age, nationality, image_url ',
            [name, team_id, position, jersey_number, age, nationality, image_url]
        );
        res.status(201).json(newPlayer.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a player
const updatePlayer = async (req, res) => {
    const { id } = req.params;
    const { name, team_id, position, jersey_number, age, nationality, image_url } = req.body;
    try {
        const updatedPlayer = await db.query(
            'UPDATE players SET name = $1, team_id = $2, position = $3, jersey_number = $4, age = $5, nationality = $6, image_url = $7 WHERE id = $8 RETURNING id, name, team_id, position, jersey_number, age, nationality, image_url ',
            [name, team_id, position, jersey_number, age, nationality, image_url, id]
        );
        if (updatedPlayer.rows.length === 0) {
            return res.status(404).json({ msg: 'Player not found' });
        }
        res.json(updatedPlayer.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a player
const deletePlayer = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPlayer = await db.query('DELETE FROM players WHERE id = $1 RETURNING * ', [id]);
        if (deletedPlayer.rows.length === 0) {
            return res.status(404).json({ msg: 'Player not found' });
        }
        res.json({ msg: 'Player deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer
};