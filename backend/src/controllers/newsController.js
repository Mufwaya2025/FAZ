const db = require('../utils/database');

// Get all news
const getNews = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, title, content, author_id, published_date, status, approved_by, rejection_reason FROM news');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new news article
const createNews = async (req, res) => {
    const { title, content, author_id } = req.body;
    try {
        const newNews = await db.query(
            'INSERT INTO news(title, content, author_id, published_date, status) VALUES($1, $2, $3, NOW(), $4) RETURNING id, title, content, author_id, published_date, status, approved_by, rejection_reason ',
            [title, content, author_id, 'pending_approval']
        );
        res.status(201).json(newNews.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a news article
const updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, content, author_id, published_date, status, approved_by, rejection_reason } = req.body;
    try {
        const updatedNews = await db.query(
            'UPDATE news SET title = $1, content = $2, author_id = $3, published_date = $4, status = $5, approved_by = $6, rejection_reason = $7 WHERE id = $8 RETURNING id, title, content, author_id, published_date, status, approved_by, rejection_reason ',
            [title, content, author_id, published_date, status, approved_by, rejection_reason, id]
        );
        if (updatedNews.rows.length === 0) {
            return res.status(404).json({ msg: 'News article not found' });
        }
        res.json(updatedNews.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a news article
const deleteNews = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNews = await db.query('DELETE FROM news WHERE id = $1 RETURNING * ', [id]);
        if (deletedNews.rows.length === 0) {
            return res.status(404).json({ msg: 'News article not found' });
        }
        res.json({ msg: 'News article deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Approve a news article
const approveNews = async (req, res) => {
    const { id } = req.params;
    const { user } = req; // User from auth middleware

    try {
        const updatedNews = await db.query(
            'UPDATE news SET status = $1, approved_by = $2, rejection_reason = NULL WHERE id = $3 RETURNING id, title, content, author_id, published_date, status, approved_by, rejection_reason ',
            ['approved', user.id, id]
        );
        if (updatedNews.rows.length === 0) {
            return res.status(404).json({ msg: 'News article not found' });
        }
        res.json(updatedNews.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Request news edit
const requestNewsEdit = async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const { user } = req; // User from auth middleware

    try {
        const updatedNews = await db.query(
            'UPDATE news SET status = $1, approved_by = $2, rejection_reason = $3 WHERE id = $4 RETURNING id, title, content, author_id, published_date, status, approved_by, rejection_reason ',
            ['rejected', user.id, rejection_reason, id]
        );
        if (updatedNews.rows.length === 0) {
            return res.status(404).json({ msg: 'News article not found' });
        }
        res.json(updatedNews.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getNews,
    createNews,
    updateNews,
    deleteNews,
    approveNews,
    requestNewsEdit
};
