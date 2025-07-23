const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'faz_scores',
    password: 'ew0fwcxs',
    port: 5432,
});

async function alterGoalScorerColumns() {
    try {
        await pool.query('ALTER TABLE matches ALTER COLUMN last_goal_scorer TYPE INTEGER USING last_goal_scorer::INTEGER;');
        await pool.query('ALTER TABLE matches ALTER COLUMN last_goal_assist TYPE INTEGER USING last_goal_assist::INTEGER;');
        console.log('Altered last_goal_scorer and last_goal_assist columns to INTEGER type.');
    } catch (err) {
        console.error('Error altering columns:', err);
    } finally {
        await pool.end();
    }
}

alterGoalScorerColumns();