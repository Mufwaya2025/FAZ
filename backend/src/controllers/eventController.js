const db = require('../utils/database');

const getMatchEvents = async (req, res) => {
    try {
        const { matchId } = req.query;
        let query = 'SELECT * FROM match_events';
        const params = [];

        if (matchId) {
            query += ' WHERE match_id = $1';
            params.push(matchId);
        }

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching match events:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const undoMatchEvent = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    let tableName;

    switch (type) {
        case 'goal':
            tableName = 'goal_scorers';
            break;
        case 'substitution':
            tableName = 'substitutions';
            break;
        default:
            tableName = 'match_events';
    }

    try {
        const eventRes = await db.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
        if (eventRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        const event = eventRes.rows[0];
        const { match_id, team_id } = event;

        await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

        if (type === 'goal') {
            const matchRes = await db.query('SELECT home_team_id FROM matches WHERE id = $1', [match_id]);
            const homeTeamId = matchRes.rows[0].home_team_id;
            const teamColumn = team_id === homeTeamId ? 'home_score' : 'away_score';
            await db.query(`UPDATE matches SET ${teamColumn} = ${teamColumn} - 1 WHERE id = $1`, [match_id]);
        } else if (type === 'substitution') {
            const matchRes = await db.query('SELECT home_team_id FROM matches WHERE id = $1', [match_id]);
            const homeTeamId = matchRes.rows[0].home_team_id;
            const teamColumn = team_id === homeTeamId ? 'home_substitutions' : 'away_substitutions';
            await db.query(`UPDATE matches SET ${teamColumn} = ${teamColumn} - 1 WHERE id = $1`, [match_id]);
        }

        const updatedMatchRes = await db.query('SELECT * FROM matches WHERE id = $1', [match_id]);
        const updatedMatch = updatedMatchRes.rows[0];

        const goalScorersRes = await db.query(
            'SELECT gs.*, p.name as player_name FROM goal_scorers gs JOIN players p ON gs.player_id = p.id WHERE gs.match_id = $1 ORDER BY gs.minute_scored',
            [match_id]
        );
        updatedMatch.goal_scorers = goalScorersRes.rows;

        const substitutionsRes = await db.query(
            'SELECT s.*, p_out.name as player_out_name, p_in.name as player_in_name FROM substitutions s JOIN players p_out ON s.player_out_id = p_out.id JOIN players p_in ON s.player_in_id = p_in.id WHERE s.match_id = $1 ORDER BY s.minute_substituted',
            [match_id]
        );
        updatedMatch.substitutions = substitutionsRes.rows;

        const eventsRes = await db.query(
            'SELECT me.*, p.name as player_name FROM match_events me JOIN players p ON me.player_id = p.id WHERE me.match_id = $1 ORDER BY me.minute_of_event',
            [match_id]
        );
        updatedMatch.events = eventsRes.rows;

        res.json(updatedMatch);
    } catch (err) {
        console.error('Error undoing event:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

module.exports = {
    undoMatchEvent,
    getMatchEvents,
};