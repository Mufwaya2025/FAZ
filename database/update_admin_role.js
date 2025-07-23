const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'faz_scores',
    password: 'ew0fwcxs',
    port: 5432,
});

async function updateUserRoles() {
    try {
        await pool.query("UPDATE users SET role = 'match_day_operator' WHERE role = 'admin';");
        console.log('Updated all users with role \'admin\' to \'match_day_operator\'.');
    } catch (err) {
        console.error('Error updating user roles:', err);
    } finally {
        await pool.end();
    }
}

updateUserRoles();