const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'faz_scores',
    password: 'ew0fwcxs',
    port: 5432,
});

async function updateRoleConstraint() {
    try {
        // Drop the existing constraint if it exists
        await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
        console.log('Dropped existing users_role_check constraint (if it existed).');

        // Add the new constraint with the 'editor' role
        await pool.query(
            "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'match_day_operator', 'super_admin', 'editor'));"
        );
        

    } catch (err) {
        console.error('Error updating role constraint:', err);
    } finally {
        await pool.end();
    }
}

updateRoleConstraint();