import React, { useState, useEffect, useRef } from 'react';

function ZPLLiveOps({ user, match, onBackToAdminDashboard, socket }) {
  const buttonStyle = {
    padding: '8px 16px',
    margin: '4px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '14px'
  };
  console.log('ZPLLiveOps - component rendered');
  console.log('ZPLLiveOps - received match prop:', JSON.stringify(match, null, 2));
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeYellowCards, setHomeYellowCards] = useState(0);
  const [awayYellowCards, setAwayYellowCards] = useState(0);
  const [homeRedCards, setHomeRedCards] = useState(0);
  const [awayRedCards, setAwayRedCards] = useState(0);
  const [homeCorners, setHomeCorners] = useState(0);
  const [awayCorners, setAwayCorners] = useState(0);
  const [homeOffsides, setHomeOffsides] = useState(0);
  const [awayOffsides, setAwayOffsides] = useState(0);
  const [homeShots, setHomeShots] = useState(0);
  const [awayShots, setAwayShots] = useState(0);
  const [homeShotsOnTarget, setHomeShotsOnTarget] = useState(0);
  const [awayShotsOnTarget, setAwayShotsOnTarget] = useState(0);
  
  const [homeFouls, setHomeFouls] = useState(0);
  const [awayFouls, setAwayFouls] = useState(0);
  const [homeSubstitutions, setHomeSubstitutions] = useState(0);
  const [awaySubstitutions, setAwaySubstitutions] = useState(0);
  const [possession, setPossession] = useState(50);
  const [minute, setMinute] = useState(0);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isDirty, setIsDirty] = useState(false); // To track if there are unsaved changes
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPlayerForEvent, setSelectedPlayerForEvent] = useState('');
  const [selectedAssistPlayerForEvent, setSelectedAssistPlayerForEvent] = useState('');
  const [currentGoalTeam, setCurrentGoalTeam] = useState('');
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false);
  const [currentPlayerSelectionType, setCurrentPlayerSelectionType] = useState(''); // e.g., 'goal', 'red_card', 'offside'
  const [playerSelectedForEvent, setPlayerSelectedForEvent] = useState('');
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [playerOut, setPlayerOut] = useState('');
  const [playerIn, setPlayerIn] = useState('');
  
  
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
  const [isMatchRunning, setIsMatchRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const playerSelectRef = useRef(null);
  const assistPlayerSelectRef = useRef(null);

  const homeTeamName = match.home_team_name || "Home Team";
  const awayTeamName = match.away_team_name || "Away Team";
  const matchId = match.id || "12345";

  const getEventIcon = (type) => {
    switch(type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'substitution': return '🔄';
      case 'corner': return '▶';
      case 'offside': return '🚩';
      case 'foul': return '⚠️';
      case 'shot': return '';
      case 'shotOnTarget': return '';
      default: return '•';
    }
  };

  const removeEvent = (eventId) => {
    setRecentEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  useEffect(() => {
    console.log('ZPLLiveOps - match prop inside useEffect:', match);
    
    
    setMinute(match.minute || 0);
    setRecentEvents([]);
    setIsDirty(false);

    console.log('ZPLLiveOps - state after initialization:', {
      homeScore: match.home_score || 0,
      awayScore: match.away_score || 0,
      homeYellowCards: match.home_yellow_cards || 0,
      awayYellowCards: match.away_yellow_cards || 0,
      homeRedCards: match.home_red_cards || 0,
      awayRedCards: match.away_red_cards || 0,
      homeCorners: match.home_corners || 0,
      awayCorners: match.away_corners || 0,
      homeOffsides: match.home_offsides || 0,
      awayOffsides: match.away_offsides || 0,
      homeShots: match.home_shots || 0,
      awayShots: match.away_shots || 0,
      homeShotsOnTarget: match.home_shots_on_target || 0,
      awayShotsOnTarget: match.away_shots_on_target || 0,
      homeFouls: match.home_fouls || 0,
      awayFouls: match.away_fouls || 0,
      homeSubstitutions: match.home_substitutions || 0,
      awaySubstitutions: match.away_substitutions || 0,
      possession: match.possession || 50,
      minute: match.minute || 0,
    });

    // socket.on('match_stats_updated', (data) => {
    //   console.log('Match stats updated from server:', data);
    //   // Update specific stats based on the received data
    //   if (data.stat === 'goal') {
    //     if (data.team === 'home') setHomeScore(data.value);
    //     else setAwayScore(data.value);
    //     if (data.team === 'home') setFlashHomeScore(true);
    //     else setFlashAwayScore(true);
    //   } else if (data.stat === 'yellow_card') {
    //     if (data.team === 'home') setHomeYellowCards(data.value);
    //     else setAwayYellowCards(data.value);
    //     if (data.team === 'home') setFlashHomeCards(true);
    //     else setFlashAwayCards(true);
    //   } else if (data.stat === 'red_card') {
    //     if (data.team === 'home') setHomeRedCards(data.value);
    //     else setAwayRedCards(data.value);
    //     if (data.team === 'home') setFlashHomeCards(true);
    //     else setFlashAwayCards(true);
    //   } else if (data.stat === 'corner') {
    //     if (data.team === 'home') setHomeCorners(data.value);
    //     else setAwayCorners(data.value);
    //     if (data.team === 'home') setFlashHomeCorners(true);
    //     else setFlashAwayCorners(true);
    //   } else if (data.stat === 'offside') {
    //     if (data.team === 'home') setHomeOffsides(data.value);
    //     else setAwayOffsides(data.value);
    //     if (data.team === 'home') setFlashHomeShots(true);
    //     else setFlashAwayShots(true);
    //   } else if (data.stat === 'shot') {
    //     if (data.team === 'home') setHomeShots(data.value);
    //     else setAwayShots(data.value);
    //     if (data.team === 'home') setFlashHomeShots(true);
    //     else setFlashAwayShots(true);
    //   } else if (data.stat === 'shot_on_target') {
    //     if (data.team === 'home') setHomeShotsOnTarget(data.value);
    //     else setAwayShotsOnTarget(data.value);
    //     if (data.team === 'home') setFlashHomeShotsOnTarget(true);
    //     else setFlashAwayShotsOnTarget(true);
    //   } else if (data.stat === 'foul') {
    //     if (data.team === 'home') setHomeFouls(data.value);
    //     else setAwayFouls(data.value);
    //   } else if (data.stat === 'substitution') {
    //     if (data.team === 'home') setHomeSubstitutions(data.value);
    //     else setAwaySubstitutions(data.value);
    //   } else if (data.stat === 'foul') {
    //     if (data.team === 'home') setHomeFouls(data.value);
    //     else setAwayFouls(data.value);
    //   } else if (data.stat === 'substitution') {
    //     if (data.team === 'home') setHomeSubstitutions(data.value);
    //     else setAwaySubstitutions(data.value);
    //   }
    //   // For possession, it's a direct update
    //   if (data.stat === 'possession') {
    //     setPossession(data.value);
    //     setFlashPossession(true);
    //   }
    //   if (data.stat === 'minute') {
    //     setMinute(data.value);
    //     setFlashMinute(true);
    //   }

    //   // Add to recent events if it's a quick-add button event
    //   if (['goal', 'yellow_card', 'red_card', 'corner', 'shot', 'shot_on_target', 'offside', 'substitution'].includes(data.stat)) {
    //     setRecentEvents(prevEvents => [{
    //       time: data.minute,
    //       type: data.stat,
    //       team: data.team,
    //       value: data.value,
    //       scorer: data.last_goal_scorer_name, // Use name from backend
    //       assist: data.last_goal_assist_name // Use name from backend
    //     }, ...prevEvents]);
    //   }
    // });

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
    let interval;
    if (isMatchRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 59) {
            setMinute(prevMinute => prevMinute + 1);
            return 0;
          } else {
            return prevSeconds + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatchRunning]);

  

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
          console.log('Fetched players:', data);
        } else {
          console.error('Failed to fetch players:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    fetchPlayers();
  }, []);

  const handlePlayerSelection = (eventType, team) => {
    setCurrentGoalTeam(team);
    setCurrentPlayerSelectionType(eventType);
    setShowPlayerSelectionModal(true);
  };

  const handleStatChange = (setter, value, eventType, team) => {
    if (eventType === 'goal' || eventType === 'yellow_card' || eventType === 'red_card' || eventType === 'corner' || eventType === 'offside' || eventType === 'shot' || eventType === 'shot_on_target' || eventType === 'foul') {
      setCurrentGoalTeam(team); // Still used for team context
      setCurrentPlayerSelectionType(eventType);
      setShowPlayerSelectionModal(true);
      return;
    } else if (eventType === 'substitution') {
      setCurrentGoalTeam(team); // Re-using currentGoalTeam for team context
      setShowSubstitutionModal(true);
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
      } else if (eventType === 'yellow_card') {
        if (team === 'home') setFlashHomeCards(true);
        else setFlashAwayCards(true);
      } else if (eventType === 'red_card') {
        if (team === 'home') setFlashHomeCards(true);
        else setFlashAwayCards(true);
      } else if (eventType === 'corner') {
        if (team === 'home') setFlashHomeCorners(true);
        else setFlashAwayCorners(true);
      } else if (eventType === 'offside') {
        if (team === 'home') setFlashHomeShots(true);
        else setFlashAwayShots(true);
      } else if (eventType === 'shot') {
        if (team === 'home') setFlashHomeShots(true);
        else setFlashAwayShots(true);
      } else if (eventType === 'shot_on_target') {
        if (team === 'home') setFlashHomeShotsOnTarget(true);
        else setFlashAwayShotsOnTarget(true);
      } else if (eventType === 'foul') {
        if (team === 'home') setHomeFouls(prev => prev + 1);
        else setAwayFouls(prev => prev + 1);
        // No flash effect for fouls
      } else if (eventType === 'substitution') {
        if (team === 'home') setHomeSubstitutions(prev => prev + 1);
        else setAwaySubstitutions(prev => prev + 1);
        // No flash effect for substitution
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
    socket.emit('publish_match_updates', { matchId: match.id, homeScore, awayScore, homeYellowCards, awayYellowCards, homeRedCards, awayRedCards, homeCorners, awayCorners, homeShots, awayShots, homeShotsOnTarget, awayShotsOnTarget, homeOffsides, awayOffsides, homeFouls, awayFouls, homeSubstitutions, awaySubstitutions, possession, minute });
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
    // 1. Save all current match statistics as the official final record
    socket.emit('publish_match_updates', { 
      matchId: match.id, 
      homeScore, awayScore, 
      homeYellowCards, awayYellowCards, 
      homeRedCards, awayRedCards, 
      homeCorners, awayCorners, 
      homeShots, awayShots, 
      homeShotsOnTarget, awayShotsOnTarget, 
      homeOffsides, awayOffsides, 
      homeFouls, awayFouls, 
      homeSubstitutions, awaySubstitutions, 
      possession, minute 
    });

    // 2. Update match status to FULL_TIME
    socket.emit('update_match_status', { matchId: match.id, status: 'FINISHED' });
    alert("Full-Time!");

    // 3. Add a 'Full-Time' event to recentEvents
    setRecentEvents(prevEvents => [{
      time: minute,
      type: 'full_time',
      description: 'Match ended: Full-Time'
    }, ...prevEvents]);

    // 4. Clear recentEvents after a short delay (optional, but good for new match)
    setTimeout(() => {
      setRecentEvents([]);
    }, 5000); // Clear after 5 seconds

    // 5. Reset all match statistics to their initial values
    setHomeScore(0);
    setAwayScore(0);
    setHomeYellowCards(0);
    setAwayYellowCards(0);
    setHomeRedCards(0);
    setAwayRedCards(0);
    setHomeCorners(0);
    setAwayCorners(0);
    setHomeOffsides(0);
    setAwayOffsides(0);
    setHomeShots(0);
    setAwayShots(0);
    setHomeShotsOnTarget(0);
    setAwayShotsOnTarget(0);
    setHomeFouls(0);
    setAwayFouls(0);
    setHomeSubstitutions(0);
    setAwaySubstitutions(0);
    setPossession(50);

    // 6. Reset the clock
    setMinute(0);
    setSeconds(0);
    setIsMatchRunning(false); // Ensure clock stops

    // 7. Set isDirty to false
    setIsDirty(false);
  };

  const handleAbandon = () => {
    console.log("Match abandoned.");
    socket.emit('update_match_status', { matchId: match.id, status: 'ABANDONED' });
    alert("Match Abandoned!");
    // Logic to update match status to ABANDONED
  };

  const handlePlayerSelectionSubmit = (selectedPlayer, selectedAssistPlayer) => {
    if (!selectedPlayer && currentPlayerSelectionType !== 'substitution') {
      alert("Please select a player.");
      return;
    }

    let statToUpdate = '';
    let valueToUpdate = 0;
    let eventData = { time: minute, type: currentPlayerSelectionType, team: currentGoalTeam };

    switch (currentPlayerSelectionType) {
      case 'goal':
        if (currentGoalTeam === 'home') {
          setHomeScore(prev => prev + 1);
          valueToUpdate = homeScore + 1;
        } else {
          setAwayScore(prev => prev + 1);
          valueToUpdate = awayScore + 1;
        }
        statToUpdate = 'goal';
        eventData = { ...eventData, scorer: selectedPlayer, assist: selectedAssistPlayer };
        break;
      case 'red_card':
        if (currentGoalTeam === 'home') {
          setHomeRedCards(prev => prev + 1);
          valueToUpdate = homeRedCards + 1;
        } else {
          setAwayRedCards(prev => prev + 1);
          valueToUpdate = awayRedCards + 1;
        }
        statToUpdate = 'red_card';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'yellow_card':
        if (currentGoalTeam === 'home') {
          setHomeYellowCards(prev => prev + 1);
          valueToUpdate = homeYellowCards + 1;
        } else {
          setAwayYellowCards(prev => prev + 1);
          valueToUpdate = awayYellowCards + 1;
        }
        statToUpdate = 'yellow_card';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'corner':
        if (currentGoalTeam === 'home') {
          setHomeCorners(prev => prev + 1);
          valueToUpdate = homeCorners + 1;
        } else {
          setAwayCorners(prev => prev + 1);
          valueToUpdate = awayCorners + 1;
        }
        statToUpdate = 'corner';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'shot':
        if (currentGoalTeam === 'home') {
          setHomeShots(prev => prev + 1);
          valueToUpdate = homeShots + 1;
        } else {
          setAwayShots(prev => prev + 1);
          valueToUpdate = awayShots + 1;
        }
        statToUpdate = 'shot';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'shot_on_target':
        if (currentGoalTeam === 'home') {
          setHomeShotsOnTarget(prev => prev + 1);
          valueToUpdate = homeShotsOnTarget + 1;
        } else {
          setAwayShotsOnTarget(prev => prev + 1);
          valueToUpdate = awayShotsOnTarget + 1;
        }
        statToUpdate = 'shot_on_target';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'foul':
        if (currentGoalTeam === 'home') {
          setHomeFouls(prev => prev + 1);
          valueToUpdate = homeFouls + 1;
        } else {
          setAwayFouls(prev => prev + 1);
          valueToUpdate = awayFouls + 1;
        }
        statToUpdate = 'foul';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      case 'offside':
        if (currentGoalTeam === 'home') {
          setHomeOffsides(prev => prev + 1);
          valueToUpdate = homeOffsides + 1;
        } else {
          setAwayOffsides(prev => prev + 1);
          valueToUpdate = awayOffsides + 1;
        }
        statToUpdate = 'offside';
        eventData = { ...eventData, player: selectedPlayer };
        break;
      default:
        break;
    }

    setIsDirty(true);
    setRecentEvents(prevEvents => [eventData, ...prevEvents]);

    const playerId = players.find(p => p.name === selectedPlayer)?.id;
    const assistId = players.find(p => p.name === selectedAssistPlayer)?.id;

    socket.emit('update_match_stats', { 
      matchId: match.id, 
      stat: statToUpdate, 
      team: currentGoalTeam, 
      value: valueToUpdate, 
      minute: minute, 
      scorer: playerId, 
      assist: assistId 
    });

    setShowPlayerSelectionModal(false);
    setSelectedPlayerForEvent('');
    setSelectedAssistPlayerForEvent('');
    setCurrentPlayerSelectionType('');
  };

  const handleSubstitutionSubmit = (selectedPlayerOutName, selectedPlayerInName) => {
    if (!playerOut || !playerIn) {
      alert("Please select both players for substitution.");
      return;
    }

    setIsDirty(true);
    const event = { time: minute, type: 'substitution', team: currentGoalTeam, playerOut: playerOut, playerIn: playerIn };
    setRecentEvents(prevEvents => [event, ...prevEvents]);

    const playerOutId = players.find(p => p.name === playerOut)?.id;
    const playerInId = players.find(p => p.name === playerIn)?.id;

    socket.emit('update_match_stats', { 
      matchId: match.id, 
      stat: 'substitution', 
      team: currentGoalTeam, 
      minute: minute, 
      playerOut: playerOutId, 
      playerIn: playerInId 
    });

    setShowSubstitutionModal(false);
    setPlayerOut('');
    setPlayerIn('');
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
      if (eventToUndo.team === 'home') {
        setHomeScore(prev => {
          const newScore = Math.max(0, prev - 1);
          revertedValue = newScore;
          return newScore;
        });
      } else {
        setAwayScore(prev => {
          const newScore = Math.max(0, prev - 1);
          revertedValue = newScore;
          return newScore;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeScore(true);
      else setFlashAwayScore(true);
    } else if (eventToUndo.type === 'yellow_card') {
      if (eventToUndo.team === 'home') {
        setHomeYellowCards(prev => {
          const newYellowCards = Math.max(0, prev - 1);
          revertedValue = newYellowCards;
          return newYellowCards;
        });
      } else {
        setAwayYellowCards(prev => {
          const newYellowCards = Math.max(0, prev - 1);
          revertedValue = newYellowCards;
          return newYellowCards;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeCards(true);
      else setFlashAwayCards(true);
    } else if (eventToUndo.type === 'red_card') {
      if (eventToUndo.team === 'home') {
        setHomeRedCards(prev => {
          const newRedCards = Math.max(0, prev - 1);
          revertedValue = newRedCards;
          return newRedCards;
        });
      } else {
        setAwayRedCards(prev => {
          const newRedCards = Math.max(0, prev - 1);
          revertedValue = newRedCards;
          return newRedCards;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeCards(true);
      else setFlashAwayCards(true);
    } else if (eventToUndo.type === 'corner') {
      if (eventToUndo.team === 'home') {
        setHomeCorners(prev => {
          const newCorners = Math.max(0, prev - 1);
          revertedValue = newCorners;
          return newCorners;
        });
      } else {
        setAwayCorners(prev => {
          const newCorners = Math.max(0, prev - 1);
          revertedValue = newCorners;
          return newCorners;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeCorners(true);
      else setFlashAwayCorners(true);
    } else if (eventToUndo.type === 'offside') {
      if (eventToUndo.team === 'home') {
        setHomeOffsides(prev => {
          const newOffsides = Math.max(0, prev - 1);
          revertedValue = newOffsides;
          return newOffsides;
        });
      } else {
        setAwayOffsides(prev => {
          const newOffsides = Math.max(0, prev - 1);
          revertedValue = newOffsides;
          return newOffsides;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeShots(true);
      else setFlashAwayShots(true);
    } else if (eventToUndo.type === 'shot') {
      if (eventToUndo.team === 'home') {
        setHomeShots(prev => {
          const newShots = Math.max(0, prev - 1);
          revertedValue = newShots;
          return newShots;
        });
      } else {
        setAwayShots(prev => {
          const newShots = Math.max(0, prev - 1);
          revertedValue = newShots;
          return newShots;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeShots(true);
      else setFlashAwayShots(true);
    } else if (eventToUndo.type === 'shot_on_target') {
      if (eventToUndo.team === 'home') {
        setHomeShotsOnTarget(prev => {
          const newShotsOnTarget = Math.max(0, prev - 1);
          revertedValue = newShotsOnTarget;
          return newShotsOnTarget;
        });
      } else {
        setAwayShotsOnTarget(prev => {
          const newShotsOnTarget = Math.max(0, prev - 1);
          revertedValue = newShotsOnTarget;
          return newShotsOnTarget;
        });
      }
      if (eventToUndo.team === 'home') setFlashHomeShotsOnTarget(true);
      else setFlashAwayShotsOnTarget(true);
    } else if (eventToUndo.type === 'foul') {
      if (eventToUndo.team === 'home') {
        setHomeFouls(prev => {
          const newFouls = Math.max(0, prev - 1);
          revertedValue = newFouls;
          return newFouls;
        });
      } else {
        setAwayFouls(prev => {
          const newFouls = Math.max(0, prev - 1);
          revertedValue = newFouls;
          return newFouls;
        });
      }
    } else if (eventToUndo.type === 'foul') {
      if (eventToUndo.team === 'home') {
        setHomeFouls(prev => {
          const newFouls = Math.max(0, prev - 1);
          revertedValue = newFouls;
          return newFouls;
        });
      } else {
        setAwayFouls(prev => {
          const newFouls = Math.max(0, prev - 1);
          revertedValue = newFouls;
          return newFouls;
        });
      }
    } else if (eventToUndo.type === 'substitution') {
      // For substitution, we only remove the event from the list as there's no direct stat to revert on the frontend
      // The backend would handle the actual substitution logic if it were implemented
      revertedValue = undefined; // No value to revert for substitution
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

  const handleSubstitutionClick = (team) => {
    setCurrentGoalTeam(team); // Re-using currentGoalTeam for team context
    setShowSubstitutionModal(true);
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
          <span>Clock {String(minute).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          <span>[⚙️]</span>
          <span>[?]</span>
        </div>
      </div>

      {/* Team Info & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>
          <h3>{homeTeamName}</h3>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {match.home_team_logo && <img src={`http://localhost:5001${match.home_team_logo}`} alt={`${homeTeamName} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
          </div>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>
          <h3>{awayTeamName}</h3>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {match.away_team_logo && <img src={`http://localhost:5001${match.away_team_logo}`} alt={`${awayTeamName} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Goals:</div>
                <div style={{ textAlign: 'center', backgroundColor: flashHomeScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeScore}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayScore ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayScore}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Yellow Cards:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeYellowCards}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayYellowCards}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Red Cards:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeRedCards}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayCards ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayRedCards}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Corners:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeCorners ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeCorners}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayCorners ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayCorners}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Offsides:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeOffsides}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayOffsides}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeShots}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayShots ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayShots}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots-on-Target:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashHomeShotsOnTarget ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{homeShotsOnTarget}</div>
        <div style={{ textAlign: 'center', backgroundColor: flashAwayShotsOnTarget ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{awayShotsOnTarget}</div>

        <div style={{ textAlign: 'right', paddingRight: '10px' }}>Possession:</div>
        <div style={{ textAlign: 'center', backgroundColor: flashPossession ? '#28a745' : 'transparent', transition: 'background-color 0.5s ease-out' }}>{possession} %</div>
        <div style={{ textAlign: 'center' }}>{100 - possession} %</div>
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
          {/* Yellow Card */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>YELLOW CARD 🟨</div>
            <button onClick={() => handleStatChange(setHomeYellowCards, 1, 'yellow_card', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayYellowCards, 1, 'yellow_card', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Red Card */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>RED CARD 🟥</div>
            <button onClick={() => handleStatChange(setHomeRedCards, 1, 'red_card', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayRedCards, 1, 'red_card', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Corner */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>CORNER ▶</div>
            <button onClick={() => handleStatChange(setHomeCorners, 1, 'corner', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayCorners, 1, 'corner', 'away')} style={buttonStyle}>Away</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
          {/* Offside */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>OFFSIDE 🚩</div>
            <button onClick={() => handleStatChange(setHomeOffsides, 1, 'offside', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayOffsides, 1, 'offside', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Shot */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>SHOT ▲</div>
            <button onClick={() => handleStatChange(setHomeShots, 1, 'shot', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayShots, 1, 'shot', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Shots on Target */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>SHOT ON TARGET 🎯</div>
            <button onClick={() => handleStatChange(setHomeShotsOnTarget, 1, 'shot_on_target', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayShotsOnTarget, 1, 'shot_on_target', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Fouls */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>FOUL ⚠️</div>
            <button onClick={() => handleStatChange(setHomeFouls, 1, 'foul', 'home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleStatChange(setAwayFouls, 1, 'foul', 'away')} style={buttonStyle}>Away</button>
          </div>
          {/* Substitution */}
          <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>SUBSTITUTION 🔄</div>
            <button onClick={() => handleSubstitutionClick('home')} style={{ ...buttonStyle, marginRight: '5px' }}>Home</button>
            <button onClick={() => handleSubstitutionClick('away')} style={buttonStyle}>Away</button>
          </div>
        </div>
        {/* Possession Slider */}
        <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', textAlign: 'center', marginTop: '15px' }}>
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

      {/* Recent Events */}
      <div style={{ marginBottom: '30px' }}>
        <h4>Recent Events (auto-scroll)</h4>
        <div style={{ border: '1px solid #4a5568', borderRadius: '5px', padding: '10px', minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>
          {recentEvents.length === 0 ? (
            <p>No recent events.</p>
          ) : (
            recentEvents.map((event, index) => (
              <p key={index} style={{ margin: '5px 0' }}>
                {event.time}' {event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : event.type === 'red_card' ? '🟥' : event.type === 'corner' ? '▶' : event.type === 'offside' ? '🚩' : event.type === 'foul' ? '⚠️' : event.type === 'substitution' ? '🔄' : '▲'} {event.team === 'home' ? homeTeamName : awayTeamName} {event.type === 'goal' && event.scorer ? `- ${event.scorer}` : ''} {event.type === 'goal' && event.assist ? `(${event.assist})` : ''} {event.type === 'red_card' && event.player ? `- ${event.player}` : ''} {event.type === 'offside' && event.player ? `- ${event.player}` : ''} {event.type === 'foul' && event.player ? `- ${event.player}` : ''} {event.type === 'substitution' && event.playerOut && event.playerIn ? `- ${event.playerOut} ⬇️ ${event.playerIn} ⬆️` : ''} - <span onClick={() => handleUndo(index)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>tap to UNDO</span>
              </p>
            ))
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setIsMatchRunning(true)} style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          START MATCH
        </button>
        <button style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          PUBLISH
        </button>
        <button onClick={() => setIsMatchRunning(false)} style={{ backgroundColor: '#f39c12', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          HALF-TIME
        </button>
        <button onClick={() => setMinute(0)} style={{ backgroundColor: '#95a5a6', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          RESET CLOCK
        </button>
        <button onClick={() => setIsMatchRunning(false)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          FULL-TIME
        </button>
        <button style={{ backgroundColor: '#95a5a6', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          ABANDON
        </button>
      </div>
      
      {/* Player Selection Modal */}
      <PlayerSelectionModal 
        showPlayerSelectionModal={showPlayerSelectionModal}
        setShowPlayerSelectionModal={setShowPlayerSelectionModal}
        playerSelectedForEvent={playerSelectedForEvent}
        setSelectedPlayerForEvent={setSelectedPlayerForEvent}
        selectedAssistPlayerForEvent={selectedAssistPlayerForEvent}
        setSelectedAssistPlayerForEvent={setSelectedAssistPlayerForEvent}
        handlePlayerSelectionSubmit={handlePlayerSelectionSubmit}
        players={players}
        currentGoalTeam={currentGoalTeam}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        currentPlayerSelectionType={currentPlayerSelectionType}
      />
      {/* Substitution Modal */}
      <SubstitutionModal 
        showSubstitutionModal={showSubstitutionModal}
        setShowSubstitutionModal={setShowSubstitutionModal}
        setPlayerOut={setPlayerOut}
        setPlayerIn={setPlayerIn}
        handleSubstitutionSubmit={handleSubstitutionSubmit}
        players={players}
        currentGoalTeam={currentGoalTeam}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        playerOut={playerOut}
        playerIn={playerIn}
      />
    </div>
  );
};

export default ZPLLiveOps;

export const SubstitutionModal = ({ showSubstitutionModal, setShowSubstitutionModal, handleSubstitutionSubmit, players, currentGoalTeam, homeTeamName, awayTeamName, playerOut, setPlayerOut, playerIn, setPlayerIn }) => {

  useEffect(() => {
    if (!showSubstitutionModal) {
      // Reset dropdowns when modal closes
      setPlayerOut('');
      setPlayerIn('');
    }
  }, [showSubstitutionModal, setPlayerOut, setPlayerIn]);

  if (!showSubstitutionModal) return null;

  const currentTeamPlayers = players.filter(p => p.team === currentGoalTeam); // Assuming players have a 'team' property

  return (
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
        <h4>Record Substitution for {currentGoalTeam === 'home' ? homeTeamName : awayTeamName}</h4>
        <select
          onChange={(e) => setPlayerOut(e.target.value)}
          value={playerOut}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #4a5568',
            backgroundColor: '#2c3e50',
            color: 'white'
          }}
        >
          <option value="">Player Out</option>
          {currentTeamPlayers.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
        <select
          onChange={(e) => setPlayerIn(e.target.value)}
          value={playerIn}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #4a5568',
            backgroundColor: '#2c3e50',
            color: 'white'
          }}
        >
          <option value="">Player In</option>
          {currentTeamPlayers.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => setShowSubstitutionModal(false)}
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
            onClick={() => handleSubstitutionSubmit(playerOut, playerIn)}
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
  );
};

export const PlayerSelectionModal = ({ showPlayerSelectionModal, setShowPlayerSelectionModal, playerSelectedForEvent, setSelectedPlayerForEvent, selectedAssistPlayerForEvent, setSelectedAssistPlayerForEvent, handlePlayerSelectionSubmit, players, currentGoalTeam, homeTeamName, awayTeamName, currentPlayerSelectionType }) => {
  if (!showPlayerSelectionModal) return null;
  
  const currentTeam = currentGoalTeam === 'home' ? homeTeamName : awayTeamName;
  let modalTitle = '';
  let playerSelectLabel = 'Select Player';

  if (currentPlayerSelectionType === 'goal') {
    modalTitle = `Record Goal for ${currentTeam}`;
    playerSelectLabel = 'Select Scorer';
  } else if (currentPlayerSelectionType === 'red_card') {
    modalTitle = `Record Red Card for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'offside') {
    modalTitle = `Record Offside for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'yellow_card') {
    modalTitle = `Record Yellow Card for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'corner') {
    modalTitle = `Record Corner for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'shot') {
    modalTitle = `Record Shot for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'shot_on_target') {
    modalTitle = `Record Shot on Target for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'foul') {
    modalTitle = `Record Foul for ${currentTeam}`;
  } else if (currentPlayerSelectionType === 'substitution') {
    modalTitle = `Record Substitution for ${currentTeam}`;
  }

  return (
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
        <h4>{modalTitle}</h4>
        <select 
          value={playerSelectedForEvent} 
          onChange={(e) => setSelectedPlayerForEvent(e.target.value)} 
          style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid #4a5568', 
            backgroundColor: '#2c3e50',
            color: 'white'
          }}
        >
          <option value="">{playerSelectLabel}</option>
          {players.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
        {currentPlayerSelectionType === 'goal' && (
          <select 
            value={selectedAssistPlayerForEvent} 
            onChange={(e) => setSelectedAssistPlayerForEvent(e.target.value)} 
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
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={() => setShowPlayerSelectionModal(false)}
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
            onClick={handlePlayerSelectionSubmit}
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
  );
};