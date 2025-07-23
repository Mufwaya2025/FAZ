const db = require('../utils/database');

// Get all matches
const getMatches = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM matches');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get match details by ID
const getMatchDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const matchRes = await db.query('SELECT * FROM matches WHERE id = $1', [id]);
        if (matchRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Match not found' });
        }
        const match = matchRes.rows[0];

        const goalScorersRes = await db.query(
            'SELECT gs.*, p.name as player_name FROM goal_scorers gs JOIN players p ON gs.player_id = p.id WHERE gs.match_id = $1 ORDER BY gs.minute_scored',
            [id]
        );
        match.goal_scorers = goalScorersRes.rows;

        const substitutionsRes = await db.query(
            'SELECT s.*, p_out.name as player_out_name, p_in.name as player_in_name FROM substitutions s JOIN players p_out ON s.player_out_id = p_out.id JOIN players p_in ON s.player_in_id = p_in.id WHERE s.match_id = $1 ORDER BY s.minute_substituted',
            [id]
        );
        match.substitutions = substitutionsRes.rows;

        const eventsRes = await db.query(
            'SELECT me.*, p.name as player_name FROM match_events me JOIN players p ON me.player_id = p.id WHERE me.match_id = $1 ORDER BY me.minute_of_event',
            [id]
        );
        match.events = eventsRes.rows;

        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new match
const createMatch = async (req, res) => {
    const { home_team_id, away_team_id, league_id, match_date, venue, admin_id } = req.body;
    try {
        const newMatch = await db.query(
            'INSERT INTO matches(home_team_id, away_team_id, league_id, match_date, venue, admin_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING * ',
            [home_team_id, away_team_id, league_id, match_date, venue, admin_id]
        );
        res.status(201).json(newMatch.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a match (general details)
const updateMatchDetails = async (req, res) => {
    const { id } = req.params;
    const { home_team_id, away_team_id, league_id, match_date, venue, status, home_score, away_score, minute, admin_id } = req.body;
    try {
        const updatedMatch = await db.query(
            'UPDATE matches SET home_team_id = $1, away_team_id = $2, league_id = $3, match_date = $4, venue = $5, status = $6, home_score = $7, away_score = $8, minute = $9, admin_id = $10 WHERE id = $11 RETURNING * ',
            [home_team_id, away_team_id, league_id, match_date, venue, status, home_score, away_score, minute, admin_id, id]
        );
        if (updatedMatch.rows.length === 0) {
            return res.status(404).json({ msg: 'Match not found' });
        }
        res.json(updatedMatch.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a match
const deleteMatch = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMatch = await db.query('DELETE FROM matches WHERE id = $1 RETURNING * ', [id]);
        if (deletedMatch.rows.length === 0) {
            return res.status(404).json({ msg: 'Match not found' });
        }
        res.json({ msg: 'Match deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update live match stats
const updateMatchStats = async (req, res) => {
    const { id } = req.params;
    const stats = req.body;

    // Build the dynamic query
    const fields = Object.keys(stats);
    const values = Object.values(stats);
    const setClauses = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    if (fields.length === 0) {
        return res.status(400).json({ msg: 'No stats provided for update.' });
    }

    const query = `UPDATE matches SET ${setClauses} WHERE id = $${fields.length + 1} RETURNING *`;
    const queryParams = [...values, id];

    try {
        const updatedMatch = await db.query(query, queryParams);
        if (updatedMatch.rows.length === 0) {
            return res.status(404).json({ msg: 'Match not found' });
        }
        res.json(updatedMatch.rows[0]);
    } catch (err) {
        console.error('Error updating match stats:', err);
        res.status(500).send('Server Error');
    }
};

// Add a goal scorer to a match
const addGoalScorer = async (req, res) => {
    const { id } = req.params;
    const { player_id, team_id, minute_scored, is_own_goal } = req.body;

    try {
        const newGoal = await db.query(
            'INSERT INTO goal_scorers (match_id, player_id, team_id, minute_scored, is_own_goal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, player_id, team_id, minute_scored, is_own_goal]
        );
        res.status(201).json(newGoal.rows[0]);
    } catch (err) {
        console.error('Error adding goal scorer:', err);
        res.status(500).send('Server Error');
    }
};

// Get all players for a specific match
const getPlayersForMatch = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            'SELECT p.* FROM players p JOIN matches m ON p.team_id = m.home_team_id OR p.team_id = m.away_team_id WHERE m.id = $1',
            [id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching players for match:', err);
        res.status(500).send('Server Error');
    }
};

// Add a substitution to a match
const addSubstitution = async (req, res) => {
    const { id } = req.params;
    const { team_id, player_out_id, player_in_id, minute_substituted } = req.body;

    try {
        const newSub = await db.query(
            'INSERT INTO substitutions (match_id, team_id, player_out_id, player_in_id, minute_substituted) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, team_id, player_out_id, player_in_id, minute_substituted]
        );
        res.status(201).json(newSub.rows[0]);
    } catch (err) {
        console.error('Error adding substitution:', err);
        res.status(500).send('Server Error');
    }
};

// Add a generic match event
const addMatchEvent = async (req, res) => {
    const { id } = req.params;
    const { team_id, player_id, minute_of_event, event_type, commentary } = req.body;

    try {
        const newEvent = await db.query(
            'INSERT INTO match_events (match_id, team_id, player_id, minute_of_event, event_type, commentary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, team_id, player_id, minute_of_event, event_type, commentary]
        );
        res.status(201).json(newEvent.rows[0]);
    } catch (err) {
        console.error('Error adding match event:', err);
        res.status(500).send('Server Error');
    }
};

// Add commentary to a match
const addCommentary = async (req, res) => {
    const { id } = req.params;
    const { minute, commentary_text } = req.body;

    try {
        const newCommentary = await db.query(
            'INSERT INTO match_commentary (match_id, minute, commentary_text) VALUES ($1, $2, $3) RETURNING *',
            [id, minute, commentary_text]
        );
        res.status(201).json(newCommentary.rows[0]);
    } catch (err) {
        console.error('Error adding commentary:', err);
        res.status(500).send('Server Error');
    }
};

// Get commentary for a match
const getCommentary = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM match_commentary WHERE match_id = $1 ORDER BY minute', [id]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching commentary:', err);
        res.status(500).send('Server Error');
    }
};

// Clock management
const startClock = async (req, res) => {
    const { id } = req.params;
    const { half } = req.body; // 'first' or 'second'
    const column = half === 'first' ? 'first_half_start_time' : 'second_half_start_time';

    try {
        const { rows } = await db.query(`UPDATE matches SET ${column} = NOW(), status = 'LIVE' WHERE id = $1 RETURNING *`, [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error starting clock:', err);
        res.status(500).send('Server Error');
    }
};

const endHalf = async (req, res) => {
    const { id } = req.params;
    const { stoppage_time_seconds } = req.body;

    try {
        const { rows } = await db.query("UPDATE matches SET status = 'HALF-TIME', stoppage_time_seconds = $1 WHERE id = $2 RETURNING *", [stoppage_time_seconds, id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error ending half:', err);
        res.status(500).send('Server Error');
    }
};

const endMatch = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query("UPDATE matches SET status = 'FINISHED', full_time_end_time = NOW() WHERE id = $1 RETURNING *", [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error ending match:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getMatches,
    getMatchDetails,
    createMatch,
    updateMatchDetails,
    deleteMatch,
    updateMatchStats,
    addGoalScorer,
    getPlayersForMatch,
    addSubstitution,
    addMatchEvent,
    addCommentary,
    getCommentary,
    startClock,
    endHalf,
    endMatch
};
