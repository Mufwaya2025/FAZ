const db = require('../backend/src/utils/database');
const fs = require('fs');
const path = require('path');

const createTables = async () => {
    const schema = fs.readFileSync(path.join(__dirname, 'postgresql_schema.sql'), 'utf8');
    const statements = schema.split(';').filter(s => s.trim() !== '');

    for (const statement of statements) {
        try {
            await db.query(statement);
            console.log(`Successfully executed: ${statement.substring(0, 50)}...`);
        } catch (err) {
            console.error(`Error executing statement: ${statement.substring(0, 50)}...`, err);
        }
    }
};

createTables();