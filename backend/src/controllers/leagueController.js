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

// Get league standings
const getLeagueStandings = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: matches } = await db.query('SELECT * FROM matches WHERE league_id = $1 AND status = $2', [id, 'FINISHED']);
        const { rows: teams } = await db.query('SELECT * FROM teams WHERE league_id = $1', [id]);

        const standings = teams.map(team => ({
            team_id: team.id,
            name: team.name,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
        }));

        matches.forEach(match => {
            const homeTeam = standings.find(t => t.team_id === match.home_team_id);
            const awayTeam = standings.find(t => t.team_id === match.away_team_id);

            if (homeTeam) {
                homeTeam.played++;
                homeTeam.goals_for += match.home_score;
                homeTeam.goals_against += match.away_score;
                if (match.home_score > match.away_score) {
                    homeTeam.wins++;
                    homeTeam.points += 3;
                } else if (match.home_score === match.away_score) {
                    homeTeam.draws++;
                    homeTeam.points += 1;
                } else {
                    homeTeam.losses++;
                }
            }

            if (awayTeam) {
                awayTeam.played++;
                awayTeam.goals_for += match.away_score;
                awayTeam.goals_against += match.home_score;
                if (match.away_score > match.home_score) {
                    awayTeam.wins++;
                    awayTeam.points += 3;
                } else if (match.away_score === match.home_score) {
                    awayTeam.draws++;
                    awayTeam.points += 1;
                } else {
                    awayTeam.losses++;
                }
            }
        });

        standings.forEach(team => {
            team.goal_difference = team.goals_for - team.goals_against;
        });

        standings.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points;
            }
            return b.goal_difference - a.goal_difference;
        });

        res.json(standings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getLeagues,
    createLeague,
    updateLeague,
    deleteLeague,
    getLeagueStandings
};