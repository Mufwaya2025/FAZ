const notificationService = require('../services/notificationService');
const db = require('../utils/database');

const updateMatch = async (req, res) => {
    const { id } = req.params;
    const { homeScore, awayScore, minute, status, events, stats } = req.body;

    try {
        const { rows } = await db.query(
            'UPDATE matches SET "homeScore" = $1, "awayScore" = $2, minute = $3, status = $4, events = $5, stats = $6 WHERE id = $7 RETURNING *',
            [homeScore, awayScore, minute, status, events, stats, id]
        );

        if (rows.length > 0) {
            const updatedMatch = rows[0];
            notificationService.sendLiveScoreUpdate(updatedMatch);
            res.status(200).send({ message: 'Match updated and notification sent.', match: updatedMatch });
        } else {
            res.status(404).send('Match not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    updateMatch
};

module.exports = {
    updateMatch
};