import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001'); // Connect to your backend WebSocket server

function MatchdayOperatorDashboard({ user, match, onBackToAdminDashboard }) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeCards, setHomeCards] = useState(0);
  const [awayCards, setAwayCards] = useState(0);
  const [homeCorners, setHomeCorners] = useState(0);
  const [awayCorners, setAwayCorners] = useState(0);
  const [homeShots, setHomeShots] = useState(0);
  const [awayShots, setAwayShots] = useState(0);
  const [homeShotsOnTarget, setHomeShotsOnTarget] = useState(0);
  const [awayShotsOnTarget, setAwayShotsOnTarget] = useState(0);
  const [possession, setPossession] = useState(50);
  const [minute, setMinute] = useState(0);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isDirty, setIsDirty] = useState(false); // To track if there are unsaved changes
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalScorer, setGoalScorer] = useState('');
  const [goalAssist, setGoalAssist] = useState('');
  const [currentGoalTeam, setCurrentGoalTeam] = useState('');
  const [flashHomeScore, setFlashHomeScore] = useState(false);
  const [flashAwayScore, setFlashAwayScore] = useState(false);
  const [flashHomeCards, setFlashHomeCards] = useState(false);
  const [flashAwayCards, setFlashAwayCards] = useState(false);
  const [flashHomeCorners, setFlashHomeCorners] = useState(false);
  const [flashAwayCorners, setFlashAwayCorners] = useState(false);
  const [flashHomeShots, setFlashHomeShots] = useState(false);
  const [flashAwayShots, setFlashAwayShots] = useState(false);
  const [flashHomeShotsOnTarget, setFlashHomeShotsOnTarget] = useState(false);
  const [flashAwayShotsOnTarget, setFlashAwayShotsOnTarget] = useState(false);
  const [flashPossession, setFlashPossession] = useState(false);
  const [flashMinute, setFlashMinute] = useState(false);
  const [players, setPlayers] = useState([]); // New state for players

  // Placeholder for match data - will be passed as props later
  const homeTeamName = match.home_team_name || "Home Team";
  const awayTeamName = match.away_team_name || "Away Team";
  const matchId = match.id || "12345";

  useEffect(() => {
    setRecentEvents([]);
    setIsDirty(false);

    socket.on('match_stats_updated', (data) => {
      console.log('Match stats updated from server:', data);
      // Update specific stats based on the received data
      if (data.stat === 'goal') {
        if (data.team === 'home') setHomeScore(data.value);
        else setAwayScore(data.value);
        if (data.team === 'home') setFlashHomeScore(true);
        else setFlashAwayScore(true);
      } else if (data.stat === 'card') {
        if (data.team === 'home') setHomeCards(data.value);
        else setAwayCards(data.value);
        if (data.team === 'home') setFlashHomeCards(true);
        else setFlashAwayCards(true);
      } else if (data.stat === 'corner') {
        if (data.team === 'home') setHomeCorners(data.value);
        else setAwayCorners(data.value);
        if (data.team === 'home') setFlashHomeCorners(true);
        else setFlashAwayCorners(true);
      } else if (data.stat === 'shot') {
        if (data.team === 'home') setHomeShots(data.value);
        else setAwayShots(data.value);
        if (data.team === 'home') setFlashHomeShots(true);
        else setFlashAwayShots(true);
      } else if (data.stat === 'shot_on_target') {
        if (data.team === 'home') setHomeShotsOnTarget(data.value);
        else setAwayShotsOnTarget(data.value);
        if (data.team === 'home') setFlashHomeShotsOnTarget(true);
        else setFlashAwayShotsOnTarget(true);
      }
      // For possession, it's a direct update
      if (data.stat === 'possession') {
        setPossession(data.value);
        setFlashPossession(true);
      }
      if (data.stat === 'minute') {
        setMinute(data.value);
        setFlashMinute(true);
      }

      // Add to recent events if it's a quick-add button event
      if (['goal', 'card', 'corner', 'shot', 'shot_on_target'].includes(data.stat)) {
        setRecentEvents(prevEvents => [{
          time: data.minute,
          type: data.stat,
          team: data.team,
          value: data.value,
          scorer: data.last_goal_scorer_name, // Use name from backend
          assist: data.last_goal_assist_name // Use name from backend
        }, ...prevEvents]);
      }
    });

    socket.on('match_status_updated', (data) => {
      console.log('Match status updated from server:', data);
      alert(`Match status changed to: ${data.status}`);
      // You might want to update UI elements based on status (e.g., disable buttons)
    });

    return () => {
      socket.off('match_stats_updated');
      socket.off('match_status_updated');
    };
  }, [matchId]);

  useEffect(() => {
    if (flashHomeScore) {
      const timer = setTimeout(() => setFlashHomeScore(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashHomeScore]);

  useEffect(() => {
    if (flashAwayScore) {
      const timer = setTimeout(() => setFlashAwayScore(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAwayScore]);

  useEffect(() => {
    if (flashHomeCards) {
      const timer = setTimeout(() => setFlashHomeCards(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashHomeCards]);

  useEffect(() => {
    if (flashAwayCards) {
      const timer = setTimeout(() => setFlashAwayCards(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAwayCards]);

  useEffect(() => {
    if (flashHomeCorners) {
      const timer = setTimeout(() => setFlashHomeCorners(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashHomeCorners]);

  useEffect(() => {
    if (flashAwayCorners) {
      const timer = setTimeout(() => setFlashAwayCorners(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAwayCorners]);

  useEffect(() => {
    if (flashHomeShots) {
      const timer = setTimeout(() => setFlashHomeShots(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashHomeShots]);

  useEffect(() => {
    if (flashAwayShots) {
      const timer = setTimeout(() => setFlashAwayShots(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAwayShots]);

  useEffect(() => {
    if (flashHomeShotsOnTarget) {
      const timer = setTimeout(() => setFlashHomeShotsOnTarget(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashHomeShotsOnTarget]);

  useEffect(() => {
    if (flashAwayShotsOnTarget) {
      const timer = setTimeout(() => setFlashAwayShotsOnTarget(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashAwayShotsOnTarget]);

  useEffect(() => {
    if (flashPossession) {
      const timer = setTimeout(() => setFlashPossession(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashPossession]);

  useEffect(() => {
    if (flashMinute) {
      const timer = setTimeout(() => setFlashMinute(false), 500);
      return () => clearTimeout(timer);
    }
  }, [flashMinute]);

  

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/v1/players', {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPlayers(data);
        } else {
          console.error('Failed to fetch players:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, []);

  const handleStatChange = (setter, value, eventType, team) => {
    if (eventType === 'goal') {
      setShowGoalModal(true);
      setCurrentGoalTeam(team);
      return;
    }
    setter(prev => {
      const newValue = prev + value;
      setIsDirty(true);
      const event = { time: minute, type: eventType, team: team, value: newValue };
      setRecentEvents(prevEvents => [event, ...prevEvents]);
      socket.emit('update_match_stats', { matchId: match.id, stat: eventType, team: team, value: newValue, minute: minute });
      // Trigger flash effect
      if (eventType === 'goal') {
        if (team === 'home') setFlashHomeScore(true);
        else setFlashAwayScore(true);
      } else if (eventType === 'card') {
        if (team === 'home') setFlashHomeCards(true);
        else setFlashAwayCards(true);
      } else if (eventType === 'corner') {
        if (team === 'home') setFlashHomeCorners(true);
        else setFlashAwayCorners(true);
      } else if (eventType === 'shot') {
        if (team === 'home') setFlashHomeShots(true);
        else setFlashAwayShots(true);
      } else if (eventType === 'shot_on_target') {
        if (team === 'home') setFlashHomeShotsOnTarget(true);
        else setFlashAwayShotsOnTarget(true);
      }
      return newValue;
    });
  };

  const handlePossessionChange = (e) => {
    setPossession(parseInt(e.target.value));
    setIsDirty(true);
    setFlashPossession(true);
  };

  const handlePublish = () => {
    socket.emit('publish_match_updates', { matchId: match.id, homeScore, awayScore, homeCards, awayCards, homeCorners, awayCorners, homeShots, awayShots, homeShotsOnTarget, awayShotsOnTarget, possession, minute });
    console.log("Publishing changes...");
    setIsDirty(false);
    alert("Changes published!");
  };

  const handleHalfTime = () => {
    console.log("Half-Time initiated.");
    socket.emit('update_match_status', { matchId: match.id, status: 'HALF_TIME' });
    alert("Half-Time!");
    // Logic to update match status to HALF_TIME
  };

  const handleFullTime = () => {
    console.log("Full-Time initiated.");
    socket.emit('update_match_status', { matchId: match.id, status: 'FULL_TIME' });
    alert("Full-Time!");
    // Logic to update match status to FULL_TIME
  };

  const handleAbandon = () => {
    console.log("Match abandoned.");
    socket.emit('update_match_status', { matchId: match.id, status: 'ABANDONED' });
    alert("Match Abandoned!");
    // Logic to update match status to ABANDONED
  };

  const handleGoalSubmit = () => {
    if (!goalScorer) {
      alert("Please enter a goal scorer.");
      return;
    }
    // Update score locally
    if (currentGoalTeam === 'home') {
      setHomeScore(prev => prev + 1);
    } else {
      setAwayScore(prev => prev + 1);
    }
    setIsDirty(true);
    const event = { time: minute, type: 'goal', team: currentGoalTeam, scorer: goalScorer, assist: goalAssist };
    setRecentEvents(prevEvents => [event, ...prevEvents]);
    const scorerId = players.find(p => p.name === goalScorer)?.id;
    const assistId = players.find(p => p.name === goalAssist)?.id;

    socket.emit('update_match_stats', { matchId: match.id, stat: 'goal', team: currentGoalTeam, value: (currentGoalTeam === 'home' ? homeScore + 1 : awayScore + 1), minute: minute, scorer: scorerId, assist: assistId });
    setShowGoalModal(false);
    setGoalScorer('');
    setGoalAssist('');
    setCurrentGoalTeam('');
  };

  const handleUndo = (index) => {
    const eventToUndo = recentEvents[index];
    if (!eventToUndo) return;

    // Remove the event from recentEvents
    setRecentEvents(prevEvents => prevEvents.filter((_, i) => i !== index));

    // Revert the stat locally
    let revertedValue;
    if (eventToUndo.type === 'goal') {
      setHomeScore(prev => (eventToUndo.team === 'home' ? prev - 1 : prev));
      setAwayScore(prev => (eventToUndo.team === 'away' ? prev - 1 : prev));
      revertedValue = eventToUndo.team === 'home' ? homeScore - 1 : awayScore - 1;
      if (eventToUndo.team === 'home') setFlashHomeScore(true);
      else setFlashAwayScore(true);
    } else if (eventToUndo.type === 'card') {
      setHomeCards(prev => (eventToUndo.team === 'home' ? prev - 1 : prev));
      setAwayCards(prev => (eventToUndo.team === 'away' ? prev - 1 : prev));
      revertedValue = eventToUndo.team === 'home' ? homeCards - 1 : awayCards - 1;
      if (eventToUndo.team === 'home') setFlashHomeCards(true);
      else setFlashAwayCards(true);
    } else if (eventToUndo.type === 'corner') {
      setHomeCorners(prev => (eventToUndo.team === 'home' ? prev - 1 : prev));
      setAwayCorners(prev => (eventToUndo.team === 'away' ? prev - 1 : prev));
      revertedValue = eventToUndo.team === 'home' ? homeCorners - 1 : awayCorners - 1;
      if (eventToUndo.team === 'home') setFlashHomeCorners(true);
      else setFlashAwayCorners(true);
    } else if (eventToUndo.type === 'shot') {
      setHomeShots(prev => (eventToUndo.team === 'home' ? prev - 1 : prev));
      setAwayShots(prev => (eventToUndo.team === 'away' ? prev - 1 : prev));
      revertedValue = eventToUndo.team === 'home' ? homeShots - 1 : awayShots - 1;
      if (eventToUndo.team === 'home') setFlashHomeShots(true);
      else setFlashAwayShots(true);
    } else if (eventToUndo.type === 'shot_on_target') {
      setHomeShotsOnTarget(prev => (eventToUndo.team === 'home' ? prev - 1 : prev));
      setAwayShotsOnTarget(prev => (eventToUndo.team === 'away' ? prev - 1 : prev));
      revertedValue = eventToUndo.team === 'home' ? homeShotsOnTarget - 1 : awayShotsOnTarget - 1;
      if (eventToUndo.team === 'home') setFlashHomeShotsOnTarget(true);
      else setFlashAwayShotsOnTarget(true);
    }

    setIsDirty(true); // Mark as dirty since a change occurred

    // Emit undo event to backend
    socket.emit('undo_match_stat', { 
      matchId: match.id, 
      stat: eventToUndo.type, 
      team: eventToUndo.team, 
      value: revertedValue // Send the new value after undo
    });
  };

  return (
    <div style={{ 
      backgroundColor: '#2c3e50', 
      minHeight: '100vh', 
      color: 'white', 
      fontFamily: 'monospace', 
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #4a5568', 
        paddingBottom: '10px', 
        marginBottom: '20px' 
      }}>
        <button onClick={onBackToAdminDashboard} style={{ backgroundColor: '#555', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Back to Dashboard</button>
        <h2 style={{ margin: 0 }}>ZPL LIVE OPS – Match {matchId}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Clock {minute}'</span>
          <span>[⚙️]</span>
          <span>[?]</span>
        </div>
      </div>

      {/* Team Info & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>
          <h3>{homeTeamName}</h3>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#555', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Home logo
          </div>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>
          <h3>{awayTeamName}</h3>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#555', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Away logo
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Goals:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {homeScore}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {awayScore}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Cards:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {homeCards}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {awayCards}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Corners:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeCorners ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {homeCorners}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayCorners ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {awayCorners}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {homeShots}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {awayShots}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots-on-Target:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeShotsOnTarget ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {homeShotsOnTarget}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayShotsOnTarget ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {awayShotsOnTarget}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Possession:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashPossession ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>▢ {possession} %</div>
        <div style={{ textAlign: 'center' }}>▢ {100 - possession} %</div>
      </div>

      {/* Quick-Add Buttons */}
      <div style={{ marginBottom: '30px' }}>
        <h4>Quick-Add Buttons (one click → column auto-increments)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          {/* Goal */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>GOAL ⚽</div>
            <button onClick={() => handleStatChange(setHomeScore, 1, 'goal', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayScore, 1, 'goal', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Card */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>CARD 🟨</div>
            <button onClick={() => handleStatChange(setHomeCards, 1, 'card', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayCards, 1, 'card', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Corner */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>CORNER ▶</div>
            <button onClick={() => handleStatChange(setHomeCorners, 1, 'corner', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayCorners, 1, 'corner', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Shot */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>SHOT ▲</div>
            <button onClick={() => handleStatChange(setHomeShots, 1, 'shot', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayShots, 1, 'shot', 'away')} style={buttonStyle}>Away</button>
          </div>
        </div>
        {/* Shots on Target - separate for now, can be integrated into Shot later */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>SHOT ON TARGET 🎯</div>
            <button onClick={() => handleStatChange(setHomeShotsOnTarget, 1, 'shot_on_target', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayShotsOnTarget, 1, 'shot_on_target', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Possession Slider */}
          <div style={{ gridColumn: 'span 3', border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>POSSESSION</div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={possession} 
              onChange={handlePossessionChange} 
              style={{ width: '90%' }}
            />
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div style={{ marginBottom: '30px' }}>
        <h4>Recent Events (auto-scroll)</h4>
        <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>
          {recentEvents.length === 0 ? (
            <p>No recent events.</p>
          ) : (
            recentEvents.map((event, index) => (
              <p key={index} style={{ margin: '5px 0' }}>
                {event.time}' {event.type === 'goal' ? '⚽' : event.type === 'card' ? '🟨' : event.type === 'corner' ? '▶' : '▲'} {event.team === 'home' ? homeTeamName : awayTeamName} {event.type === 'goal' && event.scorer ? `- ${event.scorer}` : ''} {event.type === 'goal' && event.assist ? `(${event.assist})` : ''} - <span onClick={() => handleUndo(index)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>tap to UNDO</span>
              </p>
            ))
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={handlePublish} 
          style={{ 
            ...buttonStyle, 
            backgroundColor: isDirty ? '#28a745' : '#555', 
            cursor: isDirty ? 'pointer' : 'not-allowed' 
          }}
          disabled={!isDirty}
        >
          PUBLISH
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleHalfTime} style={buttonStyle}>HALF-TIME</button>
          <button onClick={handleFullTime} style={buttonStyle}>FULL-TIME</button>
          <button onClick={handleAbandon} style={buttonStyle}>ABANDON</button>
        </div>
      </div>

      {showGoalModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: '1000'
        }}>
          <div style={{
            backgroundColor: '#34495e',
            padding: '20px',
            borderRadius: '8px',
            color: 'white',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h4>Record Goal for {currentGoalTeam === 'home' ? homeTeamName : awayTeamName}</h4>
            <select 
              value={goalScorer} 
              onChange={(e) => setGoalScorer(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Scorer</option>
              {players.map(player => (
                <option key={player.id} value={player.name}>{player.name}</option>
              ))}
            </select>
            <select 
              value={goalAssist} 
              onChange={(e) => setGoalAssist(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Assist (Optional)</option>
              {players.map(player => (
                <option key={player.id} value={player.name}>{player.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowGoalModal(false)}
                style={{ 
                  backgroundColor: '#e74c3c', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 15px', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleGoalSubmit}
                style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 15px', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default MatchdayOperatorDashboard;
