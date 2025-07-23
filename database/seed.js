const db = require('../backend/src/utils/database');

const seedDatabase = async () => {
    try {
        console.log('Seeding database...');

        // Clear existing data (optional, for fresh start)
        await db.query('DELETE FROM matches');
        await db.query('DELETE FROM teams');
        await db.query('DELETE FROM leagues');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM news');
        await db.query('DELETE FROM user_favorites');

        // Insert Leagues
        const league1 = await db.query(
            'INSERT INTO leagues(name, country, season) VALUES($1, $2, $3) RETURNING id',
            ['Premier League', 'England', '2024/2025']
        );
        const league1Id = league1.rows[0].id;

        const league2 = await db.query(
            'INSERT INTO leagues(name, country, season) VALUES($1, $2, $3) RETURNING id',
            ['La Liga', 'Spain', '2024/2025']
        );
        const league2Id = league2.rows[0].id;

        // Insert Teams
        const team1 = await db.query(
            'INSERT INTO teams(name, logo_url, league_id) VALUES($1, $2, $3) RETURNING id',
            ['Manchester United', 'https://example.com/manutd.png', league1Id]
        );
        const team1Id = team1.rows[0].id;

        const team2 = await db.query(
            'INSERT INTO teams(name, logo_url, league_id) VALUES($1, $2, $3) RETURNING id',
            ['Liverpool', 'https://example.com/liverpool.png', league1Id]
        );
        const team2Id = team2.rows[0].id;

        const team3 = await db.query(
            'INSERT INTO teams(name, logo_url, league_id) VALUES($1, $2, $3) RETURNING id',
            ['Real Madrid', 'https://example.com/realmadrid.png', league2Id]
        );
        const team3Id = team3.rows[0].id;

        const team4 = await db.query(
            'INSERT INTO teams(name, logo_url, league_id) VALUES($1, $2, $3) RETURNING id',
            ['Barcelona', 'https://example.com/barcelona.png', league2Id]
        );
        const team4Id = team4.rows[0].id;

        // Insert Matches
        await db.query(
            'INSERT INTO matches(home_team_id, away_team_id, league_id, match_date, status, home_score, away_score) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [team1Id, team2Id, league1Id, '2025-08-10 15:00:00', 'scheduled', 0, 0]
        );

        await db.query(
            'INSERT INTO matches(home_team_id, away_team_id, league_id, match_date, status, home_score, away_score) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [team3Id, team4Id, league2Id, '2025-08-11 18:00:00', 'scheduled', 0, 0]
        );

        await db.query(
            'INSERT INTO matches(home_team_id, away_team_id, league_id, match_date, status, home_score, away_score, minute) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            [team1Id, team3Id, league1Id, '2025-07-11 20:00:00', 'live', 1, 0, 45]
        );

        console.log('Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // It's good practice to end the pool after seeding if this is a one-off script
        // process.exit(0);
    }
};

seedDatabase();