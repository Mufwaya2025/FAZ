const db = require('../utils/database');

const calculateFinalStats = async (matchId) => {
    const stats = {
        home_shots: 0,
        away_shots: 0,
        home_shots_on_target: 0,
        away_shots_on_target: 0,
        home_corners: 0,
        away_corners: 0,
        home_fouls: 0,
        away_fouls: 0,
        home_yellow_cards: 0,
        away_yellow_cards: 0,
        home_red_cards: 0,
        away_red_cards: 0,
        home_offsides: 0,
        away_offsides: 0,
    };

    const { rows: events } = await db.query('SELECT * FROM match_events WHERE match_id = $1', [matchId]);
    const { rows: match } = await db.query('SELECT home_team_id, away_team_id FROM matches WHERE id = $1', [matchId]);
    const { home_team_id, away_team_id } = match[0];

    events.forEach(event => {
        if (event.team_id === home_team_id) {
            switch (event.event_type) {
                case 'shot_on_target':
                    stats.home_shots_on_target++;
                    stats.home_shots++;
                    break;
                case 'shot_off_target':
                    stats.home_shots++;
                    break;
                case 'corner':
                    stats.home_corners++;
                    break;
                case 'foul':
                    stats.home_fouls++;
                    break;
                case 'yellow_card':
                    stats.home_yellow_cards++;
                    break;
                case 'red_card':
                    stats.home_red_cards++;
                    break;
                case 'offside':
                    stats.home_offsides++;
                    break;
            }
        } else if (event.team_id === away_team_id) {
            switch (event.event_type) {
                case 'shot_on_target':
                    stats.away_shots_on_target++;
                    stats.away_shots++;
                    break;
                case 'shot_off_target':
                    stats.away_shots++;
                    break;
                case 'corner':
                    stats.away_corners++;
                    break;
                case 'foul':
                    stats.away_fouls++;
                    break;
                case 'yellow_card':
                    stats.away_yellow_cards++;
                    break;
                case 'red_card':
                    stats.away_red_cards++;
                    break;
                case 'offside':
                    stats.away_offsides++;
                    break;
            }
        }
    });

    return stats;
};

const startClock = async (req, res, io) => {
    const { id } = req.params;
    const { half } = req.body; // 'first' or 'second'
    const column = half === 'first' ? 'first_half_start_time' : 'second_half_start_time';

    try {
        const { rows } = await db.query(`UPDATE matches SET ${column} = NOW(), status = 'LIVE' WHERE id = $1 RETURNING *`, [id]);
        io.emit('match_updated', rows[0]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error starting clock:', err);
        res.status(500).send('Server Error');
    }
};

const endHalf = async (req, res, io) => {
    const { id } = req.params;
    const { stoppage_time_seconds } = req.body;

    try {
        const { rows } = await db.query("UPDATE matches SET status = 'HALF-TIME', stoppage_time_seconds = $1 WHERE id = $2 RETURNING *", [stoppage_time_seconds, id]);
        io.emit('match_updated', rows[0]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error ending half:', err);
        res.status(500).send('Server Error');
    }
};

const endMatch = async (req, res, io) => {
    const { id } = req.params;
    try {
        const finalStats = await calculateFinalStats(id);
        const { rows } = await db.query(
            `UPDATE matches SET 
                status = 'FINISHED', 
                full_time_end_time = NOW(),
                home_shots = $1,
                away_shots = $2,
                home_shots_on_target = $3,
                away_shots_on_target = $4,
                home_corners = $5,
                away_corners = $6,
                home_fouls = $7,
                away_fouls = $8,
                home_yellow_cards = $9,
                away_yellow_cards = $10,
                home_red_cards = $11,
                away_red_cards = $12,
                home_offsides = $13,
                away_offsides = $14
            WHERE id = $15 RETURNING *`,
            [
                finalStats.home_shots,
                finalStats.away_shots,
                finalStats.home_shots_on_target,
                finalStats.away_shots_on_target,
                finalStats.home_corners,
                finalStats.away_corners,
                finalStats.home_fouls,
                finalStats.away_fouls,
                finalStats.home_yellow_cards,
                finalStats.away_yellow_cards,
                finalStats.home_red_cards,
                finalStats.away_red_cards,
                finalStats.home_offsides,
                finalStats.away_offsides,
                id
            ]
        );
        io.emit('match_finished', rows[0]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error ending match:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    startClock,
    endHalf,
    endMatch,
};
