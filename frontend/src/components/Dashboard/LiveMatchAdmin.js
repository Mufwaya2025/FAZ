import React, { useState, useEffect } from 'react';
import './LiveMatchAdmin.css';
import GoalScorerModal from './GoalScorerModal';
import SubstitutionModal from './SubstitutionModal';
import EventModal from './EventModal';
import ConfirmationModal from './ConfirmationModal';
import { ArrowLeft, Shield, Star, CornerRightUp, RectangleVertical, RectangleHorizontal, X, Flag, ArrowRightLeft, Play, Pause, Square } from 'lucide-react';

function LiveMatchAdmin({ matchData, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedStat, setLastUpdatedStat] = useState(null);

  // State for real-time stats
  const [homeScore, setHomeScore] = useState(matchData.home_score || 0);
  const [awayScore, setAwayScore] = useState(matchData.away_score || 0);
  
  // Possession Timer State
  const [possessionHolder, setPossessionHolder] = useState(null); // 'home' or 'away'
  const [homePossessionSeconds, setHomePossessionSeconds] = useState(matchData.home_possession_seconds || 0);
  const [awayPossessionSeconds, setAwayPossessionSeconds] = useState(matchData.away_possession_seconds || 0);

  // Goal Scorer State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalScoringTeam, setGoalScoringTeam] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState([]);
  
  // Substitution State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [substitutingTeam, setSubstitutingTeam] = useState(null);

  // Generic Event State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTeam, setEventTeam] = useState(null);
  const [eventType, setEventType] = useState(null);

  // Unified Events State
  const [events, setEvents] = useState([]);

  // Commentary State
  const [commentaryText, setCommentaryText] = useState('');
  const [commentaryFeed, setCommentaryFeed] = useState([]);

  // Undo State
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [eventToUndo, setEventToUndo] = useState(null);

  // Match Clock State
  const [matchStatus, setMatchStatus] = useState(matchData.status || 'SCHEDULED');
  const [minute, setMinute] = useState(matchData.minute || 0);
  const [stoppageTime, setStoppageTime] = useState(matchData.stoppage_time_seconds || 0);
  const [firstHalfStartTime, setFirstHalfStartTime] = useState(matchData.first_half_start_time ? new Date(matchData.first_half_start_time) : null);
  const [secondHalfStartTime, setSecondHalfStartTime] = useState(matchData.second_half_start_time ? new Date(matchData.second_half_start_time) : null);

  // --- DERIVED STATE ---
  const homeShots = events.filter(e => e.team_id === matchData.home_team_id && (e.type === 'shot_on_target' || e.type === 'shot_off_target')).length;
  const awayShots = events.filter(e => e.team_id === matchData.away_team_id && (e.type === 'shot_on_target' || e.type === 'shot_off_target')).length;
  const homeShotsOnTarget = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'shot_on_target').length;
  const awayShotsOnTarget = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'shot_on_target').length;
  const homeCorners = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'corner').length;
  const awayCorners = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'corner').length;
  const homeFouls = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'foul').length;
  const awayFouls = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'foul').length;
  const homeYellowCards = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'yellow_card').length;
  const awayYellowCards = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'yellow_card').length;
  const homeRedCards = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'red_card').length;
  const awayRedCards = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'red_card').length;
  const homeOffsides = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'offside').length;
  const awayOffsides = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'offside').length;
  const homeSubstitutions = events.filter(e => e.team_id === matchData.home_team_id && e.type === 'substitution').length;
  const awaySubstitutions = events.filter(e => e.team_id === matchData.away_team_id && e.type === 'substitution').length;

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
          const combinedEvents = [
            ...(data.goal_scorers || []).map(g => ({ ...g, type: 'goal', minute: g.minute_scored })),
            ...(data.substitutions || []).map(s => ({ ...s, type: 'substitution', minute: s.minute_substituted })),
            ...(data.events || []).map(e => ({ ...e, type: e.event_type, minute: e.minute_of_event }))
          ].sort((a, b) => a.minute - b.minute);
          setEvents(combinedEvents);
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

    const fetchCommentary = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/commentary`);
        const data = await response.json();
        if (response.ok) {
          setCommentaryFeed(data);
        } else {
          console.error('Failed to fetch commentary:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching commentary:', error);
      }
    };

    if (matchData.id) {
      fetchPlayers();
      fetchMatchDetails();
      fetchCommentary();
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
    const clockInterval = setInterval(() => {
      if (matchStatus === 'LIVE' && firstHalfStartTime) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - firstHalfStartTime) / 1000);
        const currentMinute = Math.floor(elapsedSeconds / 60) + 1;
        setMinute(currentMinute > 45 ? 45 : currentMinute);
      } else if (matchStatus === 'LIVE' && secondHalfStartTime) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - secondHalfStartTime) / 1000);
        const currentMinute = 45 + Math.floor(elapsedSeconds / 60) + 1;
        setMinute(currentMinute > 90 ? 90 : currentMinute);
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [matchStatus, firstHalfStartTime, secondHalfStartTime]);

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
        const newGoal = await response.json();
        setEvents(prev => [...prev, { ...newGoal, type: 'goal', minute: newGoal.minute_scored }].sort((a, b) => a.minute - b.minute));
        if (goalScoringTeam === 'home') {
          setHomeScore(prev => prev + 1);
        } else {
          setAwayScore(prev => prev + 1);
        }
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

  const handleEvent = (team, type) => {
    setEventTeam(team);
    setEventType(type);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (playerId) => {
    const teamId = eventTeam === 'home' ? matchData.home_team_id : matchData.away_team_id;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          team_id: teamId,
          player_id: playerId,
          minute_of_event: minute,
          event_type: eventType,
        }),
      });
      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, { ...newEvent, type: newEvent.event_type, minute: newEvent.minute_of_event }].sort((a, b) => a.minute - b.minute));
      }
    } catch (error) {
      console.error(`Error adding ${eventType}:`, error);
    }

    setIsEventModalOpen(false);
    setEventTeam(null);
    setEventType(null);
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
        const newSub = await response.json();
        setEvents(prev => [...prev, { ...newSub, type: 'substitution', minute: newSub.minute_substituted }].sort((a, b) => a.minute - b.minute));
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

  const handleCommentarySubmit = async () => {
    if (!commentaryText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/commentary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          minute: minute,
          commentary_text: commentaryText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setCommentaryFeed(prev => [...prev, newComment]);
        setCommentaryText('');
      } else {
        const data = await response.json();
        alert(`Failed to add commentary: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error adding commentary:', error);
    }
  };

  const handleUndoEvent = async () => {
    if (!eventToUndo) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/events/${eventToUndo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ type: eventToUndo.type }),
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        // Update all relevant state with the new data from the backend
        setHomeScore(updatedMatch.home_score);
        setAwayScore(updatedMatch.away_score);
        
        const combinedEvents = [
          ...(updatedMatch.goal_scorers || []).map(g => ({ ...g, type: 'goal', minute: g.minute_scored })),
          ...(updatedMatch.substitutions || []).map(s => ({ ...s, type: 'substitution', minute: s.minute_substituted })),
          ...(updatedMatch.events || []).map(e => ({ ...e, type: e.event_type, minute: e.minute_of_event }))
        ].sort((a, b) => a.minute - b.minute);
        setEvents(combinedEvents);
      } else {
        alert('Failed to undo event.');
      }
    } catch (error) {
      console.error('Error undoing event:', error);
    }

    setIsUndoModalOpen(false);
    setEventToUndo(null);
  };

  const handlePossessionChange = (team) => {
    setPossessionHolder(team);
  };

  const handleClockAction = async (action) => {
    let half;
    switch(action) {
      case 'start_first_half':
        half = 'first';
        break;
      case 'start_second_half':
        half = 'second';
        break;
      default:
        break;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchData.id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ half, stoppage_time_seconds: stoppageTime }),
      });
      const data = await response.json();
      if (response.ok) {
        setMatchStatus(data.status);
        if (data.first_half_start_time) setFirstHalfStartTime(new Date(data.first_half_start_time));
        if (data.second_half_start_time) setSecondHalfStartTime(new Date(data.second_half_start_time));
      } else {
        alert(`Failed to ${action}: ${data.msg}`);
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
    }
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
        </div>
      </div>

      <div className="match-controls">
        <div className="control-card">
          <h4>Match Clock</h4>
          <div className="clock-controls">
            <button onClick={() => handleClockAction('start_first_half')} disabled={matchStatus !== 'SCHEDULED'}><Play /> Start 1st Half</button>
            <button onClick={() => handleClockAction('end_half')} disabled={matchStatus !== 'LIVE'}><Pause /> End Half</button>
            <button onClick={() => handleClockAction('start_second_half')} disabled={matchStatus !== 'HALF-TIME'}><Play /> Start 2nd Half</button>
            <button onClick={() => handleClockAction('end_match')} disabled={matchStatus !== 'LIVE'}><Square /> End Match</button>
            <input type="number" value={stoppageTime} onChange={(e) => setStoppageTime(e.target.value)} placeholder="Stoppage Time" />
          </div>
        </div>
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
            <button onClick={() => handleEvent('home', 'shot_on_target')} className="action-button">
              <Shield size={16} /> Shot On
            </button>
            <button onClick={() => handleEvent('home', 'shot_off_target')} className="action-button">
              <Shield size={16} /> Shot Off
            </button>
            <button onClick={() => handleEvent('home', 'corner')} className="action-button">
              <CornerRightUp size={16} /> Corner
            </button>
            <button onClick={() => handleEvent('home', 'yellow_card')} className="action-button yellow-card-button">
              <RectangleVertical size={16} /> Yellow
            </button>
            <button onClick={() => handleEvent('home', 'red_card')} className="action-button red-card-button">
              <RectangleHorizontal size={16} /> Red
            </button>
            <button onClick={() => handleEvent('home', 'foul')} className="action-button">
              <X size={16} /> Foul
            </button>
            <button onClick={() => handleEvent('home', 'offside')} className="action-button">
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
            <button onClick={() => handleEvent('away', 'shot_on_target')} className="action-button">
              <Shield size={16} /> Shot On
            </button>
            <button onClick={() => handleEvent('away', 'shot_off_target')} className="action-button">
              <Shield size={16} /> Shot Off
            </button>
            <button onClick={() => handleEvent('away', 'corner')} className="action-button">
              <CornerRightUp size={16} /> Corner
            </button>
            <button onClick={() => handleEvent('away', 'yellow_card')} className="action-button yellow-card-button">
              <RectangleVertical size={16} /> Yellow
            </button>
            <button onClick={() => handleEvent('away', 'red_card')} className="action-button red-card-button">
              <RectangleHorizontal size={16} /> Red
            </button>
            <button onClick={() => handleEvent('away', 'foul')} className="action-button">
              <X size={16} /> Foul
            </button>
            <button onClick={() => handleEvent('away', 'offside')} className="action-button">
              <Flag size={16} /> Offside
            </button>
            <button onClick={() => handleSubstitution('away')} className="action-button">
              <ArrowRightLeft size={16} /> Substitution
            </button>
          </div>
        </div>
      </div>

      <div className="commentary-container">
        <h3>Live Commentary</h3>
        <div className="commentary-feed">
          {commentaryFeed.map(comment => (
            <div key={comment.id} className="commentary-item">
              <strong>{comment.minute}'</strong>
              <p>{comment.commentary_text}</p>
            </div>
          ))}
        </div>
        <div className="commentary-input-area">
          <input 
            type="text"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            placeholder="Add a new commentary event..."
          />
          <button onClick={handleCommentarySubmit}>Post</button>
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

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        teamName={eventTeam === 'home' ? matchData.home_team_name : matchData.away_team_name}
        players={matchPlayers.filter(p => p.team_id === (eventTeam === 'home' ? matchData.home_team_id : matchData.away_team_id))}
        eventType={eventType}
        onSubmit={handleEventSubmit}
      />

      <ConfirmationModal
        isOpen={isUndoModalOpen}
        onClose={() => setIsUndoModalOpen(false)}
        onConfirm={handleUndoEvent}
        title="Undo Event"
        message="Are you sure you want to undo this event? This action cannot be reversed."
      />

      <div className="substitution-history-container">
        <h3>Match Events</h3>
        <div className="events-feed">
          {events.map(event => (
            <div key={`${event.type}-${event.id}`} className={`event-item-admin ${event.team_id === matchData.home_team_id ? 'home' : 'away'}`} onClick={() => { setEventToUndo(event); setIsUndoModalOpen(true); }}>
              <div className="event-icon-admin">
                {event.type === 'goal' && <Star size={18} />}
                {event.type === 'substitution' && <ArrowRightLeft size={18} />}
                {event.type === 'yellow_card' && <RectangleVertical size={18} />}
                {event.type === 'red_card' && <RectangleHorizontal size={18} />}
              </div>
              <div className="event-minute-admin">{event.minute}'</div>
              <div className="event-details-admin">
                {event.type === 'goal' && <span>Goal for {event.team_id === matchData.home_team_id ? matchData.home_team_name : matchData.away_team_name}! <strong>{event.player_name}</strong></span>}
                {event.type === 'substitution' && <span><span className="player-out">{event.player_out_name}</span> → <span className="player-in">{event.player_in_name}</span> ({event.team_id === matchData.home_team_id ? matchData.home_team_name : matchData.away_team_name})</span>}
                {event.type === 'yellow_card' && <span>Yellow Card for <strong>{event.player_name}</strong> ({event.team_id === matchData.home_team_id ? matchData.home_team_name : matchData.away_team_name})</span>}
                {event.type === 'red_card' && <span>Red Card for <strong>{event.player_name}</strong> ({event.team_id === matchData.home_team_id ? matchData.home_team_name : matchData.away_team_name})</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveMatchAdmin;