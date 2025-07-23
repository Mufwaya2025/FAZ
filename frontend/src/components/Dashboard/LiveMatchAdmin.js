import React, { useState, useEffect } from 'react';
import './LiveMatchAdmin.css';
import GoalScorerModal from './GoalScorerModal';
import SubstitutionModal from './SubstitutionModal';
import { ArrowLeft, Shield, Star, CornerRightUp, RectangleVertical, RectangleHorizontal, X, Flag, ArrowRightLeft } from 'lucide-react';

function LiveMatchAdmin({ matchData, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedStat, setLastUpdatedStat] = useState(null);

  // State for real-time stats
  const [homeScore, setHomeScore] = useState(matchData.home_score || 0);
  const [awayScore, setAwayScore] = useState(matchData.away_score || 0);
  const [minute, setMinute] = useState(matchData.minute || 0);
  const [homeShots, setHomeShots] = useState(matchData.home_shots || 0);
  const [awayShots, setAwayShots] = useState(matchData.away_shots || 0);
  const [homeShotsOnTarget, setHomeShotsOnTarget] = useState(matchData.home_shots_on_target || 0);
  const [awayShotsOnTarget, setAwayShotsOnTarget] = useState(matchData.away_shots_on_target || 0);
  const [homeYellowCards, setHomeYellowCards] = useState(matchData.home_yellow_cards || 0);
  const [awayYellowCards, setAwayYellowCards] = useState(matchData.away_yellow_cards || 0);
  const [homeRedCards, setHomeRedCards] = useState(matchData.home_red_cards || 0);
  const [awayRedCards, setAwayRedCards] = useState(matchData.away_red_cards || 0);
  const [homeCorners, setHomeCorners] = useState(matchData.home_corners || 0);
  const [awayCorners, setAwayCorners] = useState(matchData.away_corners || 0);
  const [homeFouls, setHomeFouls] = useState(matchData.home_fouls || 0);
  const [awayFouls, setAwayFouls] = useState(matchData.away_fouls || 0);
  const [homeOffsides, setHomeOffsides] = useState(matchData.home_offsides || 0);
  const [awayOffsides, setAwayOffsides] = useState(matchData.away_offsides || 0);
  const [homeSubstitutions, setHomeSubstitutions] = useState(matchData.home_substitutions || 0);
  const [awaySubstitutions, setAwaySubstitutions] = useState(matchData.away_substitutions || 0);
  
  // Possession Timer State
  const [possessionHolder, setPossessionHolder] = useState(null); // 'home' or 'away'
  const [homePossessionSeconds, setHomePossessionSeconds] = useState(matchData.home_possession_seconds || 0);
  const [awayPossessionSeconds, setAwayPossessionSeconds] = useState(matchData.away_possession_seconds || 0);

  // Goal Scorer State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalScoringTeam, setGoalScoringTeam] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [goalScorers, setGoalScorers] = useState([]);

  // Substitution State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [substitutingTeam, setSubstitutingTeam] = useState(null);
  const [substitutions, setSubstitutions] = useState([]);

  // --- EFFECTS ---

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}`, {
          headers: { 'x-auth-token': token },
        });
        const data = await response.json();
        if (response.ok) {
          setGoalScorers(data.goal_scorers || []);
          setSubstitutions(data.substitutions || []);
        } else {
          console.error('Failed to fetch match details:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/players`, {
          headers: { 'x-auth-token': token },
        });
        const data = await response.json();
        if (response.ok) {
          setMatchPlayers(data);
        } else {
          console.error('Failed to fetch players:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    if (matchData.id) {
      fetchPlayers();
      fetchMatchDetails();
    }
  }, [matchData.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (possessionHolder === 'home') {
        setHomePossessionSeconds(prev => prev + 1);
      } else if (possessionHolder === 'away') {
        setAwayPossessionSeconds(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [possessionHolder]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (possessionHolder) {
        updateMatchStats({
          home_possession_seconds: homePossessionSeconds,
          away_possession_seconds: awayPossessionSeconds,
        });
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [homePossessionSeconds, awayPossessionSeconds, possessionHolder]);
  
  useEffect(() => {
    setLoading(false);
  }, [matchData]);

  // --- HANDLER FUNCTIONS ---

  const triggerFlash = (stat) => {
    setLastUpdatedStat(stat);
    setTimeout(() => {
      setLastUpdatedStat(null);
    }, 500);
  };

  const updateMatchStats = async (statsToUpdate) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(statsToUpdate),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Failed to update stats: ${data.msg}`);
      }
    } catch (err) {
      console.error('Error updating stats:', err);
      alert('Error updating stats. Please check console for details.');
    }
  };

  const handleGoal = (team) => {
    setGoalScoringTeam(team);
    setIsGoalModalOpen(true);
  };

  const handleGoalScorerSubmit = async (playerId, isOwnGoal) => {
    const teamId = goalScoringTeam === 'home' ? matchData.home_team_id : matchData.away_team_id;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          player_id: playerId,
          team_id: teamId,
          minute_scored: minute,
          is_own_goal: isOwnGoal,
        }),
      });

      if (response.ok) {
        // Update score locally
        if (goalScoringTeam === 'home') {
          setHomeScore(prev => prev + 1);
        } else {
          setAwayScore(prev => prev + 1);
        }
        // Refetch goal scorers to display the new goal
        // (A more optimized approach might just add the new goal to the local state)
      } else {
        const data = await response.json();
        alert(`Failed to add goal scorer: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error adding goal scorer:', error);
      alert('Error adding goal scorer. Please check console for details.');
    }

    setIsGoalModalOpen(false);
    setGoalScoringTeam(null);
  };

  const handleCard = (team, type) => {
    const statName = team === 'home' ? (type === 'yellow' ? 'homeYellowCards' : 'homeRedCards') : (type === 'yellow' ? 'awayYellowCards' : 'awayRedCards');
    triggerFlash(statName);
    if (team === 'home') {
      if (type === 'yellow') {
        setHomeYellowCards(prev => {
          const newCount = prev + 1;
          updateMatchStats({ home_yellow_cards: newCount });
          return newCount;
        });
      } else {
        setHomeRedCards(prev => {
          const newCount = prev + 1;
          updateMatchStats({ home_red_cards: newCount });
          return newCount;
        });
      }
    } else {
      if (type === 'yellow') {
        setAwayYellowCards(prev => {
          const newCount = prev + 1;
          updateMatchStats({ away_yellow_cards: newCount });
          return newCount;
        });
      } else {
        setAwayRedCards(prev => {
          const newCount = prev + 1;
          updateMatchStats({ away_red_cards: newCount });
          return newCount;
        });
      }
    }
  };

  const handleShot = (team, onTarget) => {
    const statName = team === 'home' ? (onTarget ? 'homeShotsOnTarget' : 'homeShots') : (onTarget ? 'awayShotsOnTarget' : 'awayShots');
    triggerFlash(statName);
    if (team === 'home') {
      if (onTarget) {
        setHomeShotsOnTarget(prev => {
          const newCount = prev + 1;
          updateMatchStats({ home_shots_on_target: newCount });
          return newCount;
        });
      }
      setHomeShots(prev => {
        const newCount = prev + 1;
        updateMatchStats({ home_shots: newCount });
        return newCount;
      });
    } else {
      if (onTarget) {
        setAwayShotsOnTarget(prev => {
          const newCount = prev + 1;
          updateMatchStats({ away_shots_on_target: newCount });
          return newCount;
        });
      }
      setAwayShots(prev => {
        const newCount = prev + 1;
        updateMatchStats({ away_shots: newCount });
        return newCount;
      });
    }
  };

  const handleCorner = (team) => {
    const statName = team === 'home' ? 'homeCorners' : 'awayCorners';
    triggerFlash(statName);
    if (team === 'home') {
      setHomeCorners(prev => {
        const newCount = prev + 1;
        updateMatchStats({ home_corners: newCount });
        return newCount;
      });
    } else {
      setAwayCorners(prev => {
        const newCount = prev + 1;
        updateMatchStats({ away_corners: newCount });
        return newCount;
      });
    }
  };

  const handleFoul = (team) => {
    const statName = team === 'home' ? 'homeFouls' : 'awayFouls';
    triggerFlash(statName);
    if (team === 'home') {
      setHomeFouls(prev => {
        const newCount = prev + 1;
        updateMatchStats({ home_fouls: newCount });
        return newCount;
      });
    } else {
      setAwayFouls(prev => {
        const newCount = prev + 1;
        updateMatchStats({ away_fouls: newCount });
        return newCount;
      });
    }
  };

  const handleOffside = (team) => {
    const statName = team === 'home' ? 'homeOffsides' : 'awayOffsides';
    triggerFlash(statName);
    if (team === 'home') {
      setHomeOffsides(prev => {
        const newCount = prev + 1;
        updateMatchStats({ home_offsides: newCount });
        return newCount;
      });
    } else {
      setAwayOffsides(prev => {
        const newCount = prev + 1;
        updateMatchStats({ away_offsides: newCount });
        return newCount;
      });
    }
  };

  const handleSubstitution = (team) => {
    setSubstitutingTeam(team);
    setIsSubModalOpen(true);
  };

  const handleSubstitutionSubmit = async (playerOutId, playerInId) => {
    const teamId = substitutingTeam === 'home' ? matchData.home_team_id : matchData.away_team_id;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/substitutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          team_id: teamId,
          player_out_id: playerOutId,
          player_in_id: playerInId,
          minute_substituted: minute,
        }),
      });

      if (response.ok) {
        if (substitutingTeam === 'home') {
          setHomeSubstitutions(prev => prev + 1);
        } else {
          setAwaySubstitutions(prev => prev + 1);
        }
      } else {
        const data = await response.json();
        alert(`Failed to add substitution: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error adding substitution:', error);
      alert('Error adding substitution. Please check console for details.');
    }

    setIsSubModalOpen(false);
    setSubstitutingTeam(null);
  };

  const handlePossessionChange = (team) => {
    setPossessionHolder(team);
  };

  // --- HELPER FUNCTIONS ---

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const calculatePossessionPercentage = () => {
    const totalPossession = homePossessionSeconds + awayPossessionSeconds;
    if (totalPossession === 0) {
      return { home: 50, away: 50 };
    }
    const homePercentage = Math.round((homePossessionSeconds / totalPossession) * 100);
    const awayPercentage = 100 - homePercentage;
    return { home: homePercentage, away: awayPercentage };
  };

  const possessionPercentages = calculatePossessionPercentage();

  // --- RENDER LOGIC ---

  if (loading) return <div style={{ color: 'white' }}>Loading live match data...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!matchData) return <div style={{ color: 'white' }}>Select a live match to manage stats.</div>;

  return (
    <div className="live-match-admin-container">
      <button onClick={onBack} className="back-button">
        <ArrowLeft size={16} />
        Back to Match List
      </button>
      
      <div className="match-header">
        <div className="team-display">
          <img src={matchData.home_team_logo || 'https://via.placeholder.com/50'} alt={matchData.home_team_name} className="team-logo" />
          <h2 className="team-name">{matchData.home_team_name}</h2>
          <div className="stats-grid">
            <div className={`stat-item ${lastUpdatedStat === 'homeShots' ? 'stat-flash' : ''}`}><strong>Shots:</strong><span>{homeShots}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeShotsOnTarget' ? 'stat-flash' : ''}`}><strong>On Target:</strong><span>{homeShotsOnTarget}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeCorners' ? 'stat-flash' : ''}`}><strong>Corners:</strong><span>{homeCorners}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeFouls' ? 'stat-flash' : ''}`}><strong>Fouls:</strong><span>{homeFouls}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeYellowCards' ? 'stat-flash' : ''}`}><strong>Yellow:</strong><span>{homeYellowCards}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeRedCards' ? 'stat-flash' : ''}`}><strong>Red:</strong><span>{homeRedCards}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeOffsides' ? 'stat-flash' : ''}`}><strong>Offsides:</strong><span>{homeOffsides}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'homeSubstitutions' ? 'stat-flash' : ''}`}><strong>Subs:</strong><span>{homeSubstitutions}</span></div>
          </div>
          <div className="goal-scorers-list">
            {goalScorers.filter(g => g.team_id === matchData.home_team_id).map(goal => (
              <div key={goal.id} className="goal-scorer-item">
                <span>{goal.player_name} ({goal.minute_scored}')</span>
              </div>
            ))}
          </div>
        </div>
        <div className="score-container">
          <div className="match-minute">
            {minute}'
          </div>
          <div className="match-score">
            {homeScore} - {awayScore}
          </div>
        </div>
        <div className="team-display">
          <img src={matchData.away_team_logo || 'https://via.placeholder.com/50'} alt={matchData.away_team_name} className="team-logo" />
          <h2 className="team-name">{matchData.away_team_name}</h2>
          <div className="stats-grid">
            <div className={`stat-item ${lastUpdatedStat === 'awayShots' ? 'stat-flash' : ''}`}><strong>Shots:</strong><span>{awayShots}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayShotsOnTarget' ? 'stat-flash' : ''}`}><strong>On Target:</strong><span>{awayShotsOnTarget}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayCorners' ? 'stat-flash' : ''}`}><strong>Corners:</strong><span>{awayCorners}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayFouls' ? 'stat-flash' : ''}`}><strong>Fouls:</strong><span>{awayFouls}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayYellowCards' ? 'stat-flash' : ''}`}><strong>Yellow:</strong><span>{awayYellowCards}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayRedCards' ? 'stat-flash' : ''}`}><strong>Red:</strong><span>{awayRedCards}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awayOffsides' ? 'stat-flash' : ''}`}><strong>Offsides:</strong><span>{awayOffsides}</span></div>
            <div className={`stat-item ${lastUpdatedStat === 'awaySubstitutions' ? 'stat-flash' : ''}`}><strong>Subs:</strong><span>{awaySubstitutions}</span></div>
          </div>
          <div className="goal-scorers-list">
            {goalScorers.filter(g => g.team_id === matchData.away_team_id).map(goal => (
              <div key={goal.id} className="goal-scorer-item">
                <span>{goal.player_name} ({goal.minute_scored}')</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="match-controls">
        <div className="control-card">
          <h4>Possession</h4>
          <div className="possession-timer-container">
            <button 
              className={`possession-button home ${possessionHolder === 'home' ? 'active' : ''}`}
              onClick={() => handlePossessionChange('home')}
            >
              {matchData.home_team_name}
            </button>
            <div className="possession-details">
              <div className="possession-time">{formatTime(homePossessionSeconds)}</div>
              <div className="possession-percentage">{possessionPercentages.home}%</div>
            </div>
            <div className="possession-details">
              <div className="possession-time">{formatTime(awayPossessionSeconds)}</div>
              <div className="possession-percentage">{possessionPercentages.away}%</div>
            </div>
            <button 
              className={`possession-button away ${possessionHolder === 'away' ? 'active' : ''}`}
              onClick={() => handlePossessionChange('away')}
            >
              {matchData.away_team_name}
            </button>
          </div>
        </div>
      </div>

      <div className="action-buttons-grid">
        <div className="actions-card">
          <h4 className="home-actions-header">
            {matchData.home_team_name} Actions
          </h4>
          <div className="actions-grid">
            <button onClick={() => handleGoal('home')} className="action-button goal-button">
              <Star size={16} /> Goal
            </button>
            <button onClick={() => handleShot('home', true)} className="action-button">
              <Shield size={16} /> Shot On
            </button>
            <button onClick={() => handleShot('home', false)} className="action-button">
              <Shield size={16} /> Shot Off
            </button>
            <button onClick={() => handleCorner('home')} className="action-button">
              <CornerRightUp size={16} /> Corner
            </button>
            <button onClick={() => handleCard('home', 'yellow')} className="action-button yellow-card-button">
              <RectangleVertical size={16} /> Yellow
            </button>
            <button onClick={() => handleCard('home', 'red')} className="action-button red-card-button">
              <RectangleHorizontal size={16} /> Red
            </button>
            <button onClick={() => handleFoul('home')} className="action-button">
              <X size={16} /> Foul
            </button>
            <button onClick={() => handleOffside('home')} className="action-button">
              <Flag size={16} /> Offside
            </button>
            <button onClick={() => handleSubstitution('home')} className="action-button">
              <ArrowRightLeft size={16} /> Substitution
            </button>
          </div>
        </div>

        <div className="actions-card">
          <h4 className="away-actions-header">
            {matchData.away_team_name} Actions
          </h4>
          <div className="actions-grid">
            <button onClick={() => handleGoal('away')} className="action-button goal-button">
              <Star size={16} /> Goal
            </button>
            <button onClick={() => handleShot('away', true)} className="action-button">
              <Shield size={16} /> Shot On
            </button>
            <button onClick={() => handleShot('away', false)} className="action-button">
              <Shield size={16} /> Shot Off
            </button>
            <button onClick={() => handleCorner('away')} className="action-button">
              <CornerRightUp size={16} /> Corner
            </button>
            <button onClick={() => handleCard('away', 'yellow')} className="action-button yellow-card-button">
              <RectangleVertical size={16} /> Yellow
            </button>
            <button onClick={() => handleCard('away', 'red')} className="action-button red-card-button">
              <RectangleHorizontal size={16} /> Red
            </button>
            <button onClick={() => handleFoul('away')} className="action-button">
              <X size={16} /> Foul
            </button>
            <button onClick={() => handleOffside('away')} className="action-button">
              <Flag size={16} /> Offside
            </button>
            <button onClick={() => handleSubstitution('away')} className="action-button">
              <ArrowRightLeft size={16} /> Substitution
            </button>
          </div>
        </div>
      </div>

      <GoalScorerModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        teamName={goalScoringTeam === 'home' ? matchData.home_team_name : matchData.away_team_name}
        players={matchPlayers.filter(p => p.team_id === (goalScoringTeam === 'home' ? matchData.home_team_id : matchData.away_team_id))}
        onSubmit={handleGoalScorerSubmit}
      />

      <SubstitutionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        teamName={substitutingTeam === 'home' ? matchData.home_team_name : matchData.away_team_name}
        players={matchPlayers.filter(p => p.team_id === (substitutingTeam === 'home' ? matchData.home_team_id : matchData.away_team_id))}
        onSubmit={handleSubstitutionSubmit}
      />

      <div className="substitution-history-container">
        <h3>Substitution History</h3>
        <div className="substitution-history-columns">
          <div className="substitution-history-column">
            <h4>{matchData.home_team_name}</h4>
            <ul>
              {substitutions.filter(s => s.team_id === matchData.home_team_id).map(sub => (
                <li key={sub.id}>
                  <span>{sub.minute_substituted}'</span>
                  <span className="player-out">{sub.player_out_name}</span>
                  <span className="player-in">{sub.player_in_name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="substitution-history-column">
            <h4>{matchData.away_team_name}</h4>
            <ul>
              {substitutions.filter(s => s.team_id === matchData.away_team_id).map(sub => (
                <li key={sub.id}>
                  <span>{sub.minute_substituted}'</span>
                  <span className="player-out">{sub.player_out_name}</span>
                  <span className="player-in">{sub.player_in_name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMatchAdmin;