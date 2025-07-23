const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_DATABASE || 'faz_scores',
    password: process.env.DB_PASSWORD || 'ew0fwcxs',
    port: process.env.DB_PORT || 5432,
});

async function addPossessionSecondsColumns() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_possession_seconds INTEGER DEFAULT 0;');
        await client.query('ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_possession_seconds INTEGER DEFAULT 0;');
        await client.query('COMMIT');
        console.log('Successfully added possession seconds columns to matches table.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding columns:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

addPossessionSecondsColumns();
