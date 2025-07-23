const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_DATABASE || 'faz_scores',
    password: process.env.DB_PASSWORD || 'ew0fwcxs',
    port: process.env.DB_PORT || 5432,
});

async function createGoalScorersTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS goal_scorers (
                id SERIAL PRIMARY KEY,
                match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
                player_id INTEGER REFERENCES players(id),
                team_id INTEGER REFERENCES teams(id),
                minute_scored INTEGER,
                is_own_goal BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query('COMMIT');
        console.log('Successfully created goal_scorers table.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating goal_scorers table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

createGoalScorersTable();
