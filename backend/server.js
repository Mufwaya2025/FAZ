require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('./src/middleware/cors');
const logger = require('./src/utils/logger');
const mockData = require('./mock_data.js');
const upload = require('./src/middleware/upload'); // Import upload middleware
const multer = require('multer');
const uploadAds = multer(); // Create a multer instance for parsing form-data

const { matchController, newsController, leagueController, userController, teamController, playerController, staffController } = require('./src/controllers');
const matchApi = require('./src/api/matchApi');
const newsApi = require('./src/api/newsApi');
const { auth, authorize } = require('./src/middleware/auth');
const notificationService = require('./src/services/notificationService');

const app = express();
const server = http.createServer(app); // Correctly declare server
const io = new socketIo.Server(server, { // Correctly declare io
  cors: {
    origin: "http://localhost:3000", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

const db = require('./src/utils/database'); // Import the database connection

io.on('connection', (socket) => {
  console.log('a user connected');
  logger.info('New client connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
    logger.info('Client disconnected');
  });

  socket.on('update_match_stats', async (data) => {
    console.log('Received match stats update:', data);
    try {
      // Update the database
      const { matchId, stat, team, value, scorer, assist } = data;
      let query = '';
      let params = [];

      if (stat === 'goal') {
        query = `UPDATE matches SET ${team}_score = $1, last_goal_scorer = $3, last_goal_assist = $4 WHERE id = $2 RETURNING *`;
        params = [value, matchId, scorer, assist];
      } else if (stat === 'card') {
        query = `UPDATE matches SET ${team}_yellow_cards = $1 WHERE id = $2 RETURNING *`; // Assuming yellow cards for now
        params = [value, matchId];
      } else if (stat === 'corner') {
        query = `UPDATE matches SET ${team}_corners = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'shot') {
        query = `UPDATE matches SET ${team}_shots = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'shot_on_target') {
        query = `UPDATE matches SET ${team}_shots_on_target = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'possession') {
        query = `UPDATE matches SET possession = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'minute') {
        query = `UPDATE matches SET minute = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      }

      if (query) {
        const { rows } = await db.query(query, params);
        if (rows.length > 0) {
          const updatedMatch = rows[0];
          // Fetch player names for scorer and assist if they exist
          if (updatedMatch.last_goal_scorer) {
            const scorerResult = await db.query('SELECT name FROM players WHERE id = $1', [updatedMatch.last_goal_scorer]);
            updatedMatch.last_goal_scorer_name = scorerResult.rows[0] ? scorerResult.rows[0].name : null;
          }
          if (updatedMatch.last_goal_assist) {
            const assistResult = await db.query('SELECT name FROM players WHERE id = $1', [updatedMatch.last_goal_assist]);
            updatedMatch.last_goal_assist_name = assistResult.rows[0] ? assistResult.rows[0].name : null;
          }
          io.emit('match_stats_updated', updatedMatch); // Broadcast the updated match object
        }
      }
    } catch (error) {
      console.error('Error updating match stats:', error);
    }
  });

  socket.on('publish_match_updates', async (data) => {
    console.log('Received publish request:', data);
    try {
      const { matchId, homeScore, awayScore, homeCards, awayCards, homeCorners, awayCorners, homeShots, awayShots, homeShotsOnTarget, awayShotsOnTarget, possession, minute } = data;
      const query = `
        UPDATE matches SET
          home_score = $1,
          away_score = $2,
          home_yellow_cards = $3,
          away_yellow_cards = $4,
          home_corners = $5,
          away_corners = $6,
          home_shots = $7,
          away_shots = $8,
          home_shots_on_target = $9,
          away_shots_on_target = $10,
          possession = $11,
          minute = $12
        WHERE id = $13 RETURNING *
      `;
      const params = [
        homeScore, awayScore, homeCards, awayCards, homeCorners, awayCorners,
        homeShots, awayShots, homeShotsOnTarget, awayShotsOnTarget, possession, minute, matchId
      ];
      const { rows } = await db.query(query, params);
      if (rows.length > 0) {
        io.emit('match_stats_updated', rows[0]);
      }
    } catch (error) {
      console.error('Error publishing match updates:', error);
    }
  });

  socket.on('update_match_status', async (data) => {
    console.log('Received match status update:', data);
    try {
      const { matchId, status } = data;
      const query = 'UPDATE matches SET status = $1 WHERE id = $2 RETURNING *';
      const params = [status, matchId];
      const { rows } = await db.query(query, params);
      if (rows.length > 0) {
        io.emit('match_status_updated', rows[0]);
      }
    } catch (error) {
      console.error('Error updating match status:', error);
    }
  });

  socket.on('undo_match_stat', async (data) => {
    console.log('Received undo request:', data);
    try {
      const { matchId, stat, team, value } = data;
      let query = '';
      let params = [];

      if (stat === 'goal') {
        query = `UPDATE matches SET ${team}_score = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'card') {
        query = `UPDATE matches SET ${team}_yellow_cards = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'corner') {
        query = `UPDATE matches SET ${team}_corners = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'shot') {
        query = `UPDATE matches SET ${team}_shots = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      } else if (stat === 'shot_on_target') {
        query = `UPDATE matches SET ${team}_shots_on_target = $1 WHERE id = $2 RETURNING *`;
        params = [value, matchId];
      }

      if (query) {
        const { rows } = await db.query(query, params);
        if (rows.length > 0) {
          const updatedMatch = rows[0];
          // Fetch player names for scorer and assist if they exist
          if (updatedMatch.last_goal_scorer) {
            const scorerResult = await db.query('SELECT name FROM players WHERE id = $1', [updatedMatch.last_goal_scorer]);
            updatedMatch.last_goal_scorer_name = scorerResult.rows[0] ? scorerResult.rows[0].name : null;
          }
          if (updatedMatch.last_goal_assist) {
            const assistResult = await db.query('SELECT name FROM players WHERE id = $1', [updatedMatch.last_goal_assist]);
            updatedMatch.last_goal_assist_name = assistResult.rows[0] ? assistResult.rows[0].name : null;
          }
          io.emit('match_stats_updated', updatedMatch); // Broadcast the updated match object
        }
      }
    } catch (error) {
      console.error('Error undoing match stat:', error);
    }
  });
});


// Initialize notification service with the io instance
notificationService.init(io);

app.use(cors);
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Upload endpoint
app.post('/api/v1/upload/logo', auth, authorize(['super_admin', 'match_day_operator']), (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.status(400).json({ msg: err });
    } else {
      if(req.file == undefined){
        res.status(400).json({ msg: 'No file selected' });
      } else {
        res.status(200).json({
          msg: 'File uploaded!',
          filePath: `/uploads/${req.file.filename}`
        });
      }
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('FAZ Football Scores Backend API');
});

// User Authentication Routes
const userRoutes = require('./src/routes/api/v1/users');

// User Authentication and Management Routes
app.use('/api/v1/users', userRoutes);

// API Routes
const matchRoutes = require('./src/routes/api/v1/matches')(io);
app.use('/api/v1/matches', matchRoutes);

// Leagues Routes
const leagueRoutes = require('./src/routes/api/v1/leagues');
app.use('/api/v1/leagues', leagueRoutes);

// Teams Routes
const teamRoutes = require('./src/routes/api/v1/teams');
app.use('/api/v1/teams', teamRoutes);

const playerRoutes = require('./src/routes/api/v1/players');
app.use('/api/v1/players', playerRoutes);

// Staff Routes
const staffRoutes = require('./src/routes/api/v1/staff');
app.use('/api/v1/staff', staffRoutes);

// News Routes
const newsRoutes = require('./src/routes/api/v1/news');
app.use('/api/v1/news', newsRoutes);

// Event Routes
const eventRoutes = require('./src/routes/api/v1/events');
app.use('/api/v1/events', eventRoutes);

// Ads Routes
const adsRoutes = require('./src/routes/api/v1/ads');
app.use('/editor/ads', uploadAds.none(), adsRoutes);

// Clock Routes
const clockRoutes = require('./src/routes/api/v1/clock')(io);
app.use('/api/v1/matches', clockRoutes);

// Data Routes
const dataRoutes = require('./src/routes/api/dataRoutes.js');
app.use('/api/v1/data', dataRoutes);

// Editor API Routes
const editorRoutes = require('./src/api/editor/editor');
app.use('/editor', editorRoutes);

// Admin API Routes (Match Update)
app.put('/api/v1/matches/:id', auth, authorize(['match_day_operator', 'super_admin']), matchApi.updateMatch);


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
