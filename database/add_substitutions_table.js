const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_DATABASE || 'faz_scores',
    password: process.env.DB_PASSWORD || 'ew0fwcxs',
    port: process.env.DB_PORT || 5432,
});

async function createSubstitutionsTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS substitutions (
                id SERIAL PRIMARY KEY,
                match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
                team_id INTEGER REFERENCES teams(id),
                player_out_id INTEGER REFERENCES players(id),
                player_in_id INTEGER REFERENCES players(id),
                minute_substituted INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query('COMMIT');
        console.log('Successfully created substitutions table.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating substitutions table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

createSubstitutionsTable();
