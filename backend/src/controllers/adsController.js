const db = require('../utils/database');

const getAds = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM ads');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching ads:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const createAdScript = async (req, res) => {
    try {
        const { name, script_content, placement, start_date, end_date, placeholder } = req.body;

        const result = await db.query(
            'INSERT INTO ads (name, script_content, placement, start_date, end_date, ad_type, placeholder_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ',
            [name, script_content, placement, start_date || null, end_date || null, 'script', placeholder]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating script ad:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const clearAllAds = async (req, res) => {
    try {
        await db.query('DELETE FROM ads');
        res.status(200).json({ msg: 'All ads deleted successfully' });
    } catch (err) {
        console.error('Error clearing ads:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

module.exports = {
    createAdScript,
    getAds,
    clearAllAds,
};