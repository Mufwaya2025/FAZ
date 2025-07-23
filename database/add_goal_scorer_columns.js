const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'faz_scores',
    password: 'ew0fwcxs',
    port: 5432,
});

async function addGoalScorerColumns() {
    try {
        await pool.query('ALTER TABLE matches ADD COLUMN IF NOT EXISTS last_goal_scorer VARCHAR(255);');
        await pool.query('ALTER TABLE matches ADD COLUMN IF NOT EXISTS last_goal_assist VARCHAR(255);');
        console.log('Added last_goal_scorer and last_goal_assist columns to matches table.');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        await pool.end();
    }
}

addGoalScorerColumns();