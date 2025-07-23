import React, { useState, useEffect, useCallback } from 'react';
import LiveMatchAdmin from './LiveMatchAdmin';

function MatchManagement({ user, onSelectLiveMatch, matchStats, token }) {
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activeMatchSubTab, setActiveMatchSubTab] = useState('existing'); // Default to existing matches

  // State for new match form
  const [newMatchHomeTeam, setNewMatchHomeTeam] = useState('');
  const [newMatchAwayTeam, setNewMatchAwayTeam] = useState('');
  const [newMatchLeague, setNewMatchLeague] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('');
  const [newMatchVenue, setNewMatchVenue] = useState('');
  const [newMatchAdmin, setNewMatchAdmin] = useState('');

  // State for editing match
  const [editingMatch, setEditingMatch] = useState(null);
  const [editedMatchHomeTeam, setEditedMatchHomeTeam] = useState('');
  const [editedMatchAwayTeam, setEditedMatchAwayTeam] = useState('');
  const [editedMatchLeague, setEditedMatchLeague] = useState('');
  const [editedMatchDate, setEditedMatchDate] = useState('');
  const [editedMatchVenue, setEditedMatchVenue] = useState('');
  const [editedMatchStatus, setEditedMatchStatus] = useState('');
  const [editedMatchAdmin, setEditedMatchAdmin] = useState('');

  const fetchMatches = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/matches', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setMatches(data);
        console.log('Fetched matches:', data);
        if (data.length > 0) {
          console.log('First match object:', data[0]);
          console.log('First match status:', data[0].status);
        }
      } else {
        console.error('Failed to fetch matches:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, [token]);

  const fetchTeams = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/teams', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTeams(data);
        const uniqueStadiums = [...new Set(data.map(team => team.stadium).filter(stadium => stadium))];
        setStadiums(uniqueStadiums);
      } else {
        console.error('Failed to fetch teams:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, [token]);

  const fetchLeagues = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/leagues', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeagues(data);
      } else {
        console.error('Failed to fetch leagues:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  }, [token]);

  const fetchAdmins = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/users', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Filter users to get only admins
        const adminUsers = data.filter(user => user.role === 'match_day_operator' || user.role === 'super_admin');
        setAdmins(adminUsers);
        console.log('Fetched admins:', adminUsers);
      } else {
        console.error('Failed to fetch admins:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, [token]);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getLeagueName = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  const getAdminName = (adminId) => {
    console.log('getAdminName - adminId:', adminId);
    console.log('getAdminName - admins state:', admins);
    const admin = admins.find(a => a.id === adminId);
    return admin ? admin.name || admin.email : 'N/A';
  };

  const handleCreateMatch = async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          home_team_id: newMatchHomeTeam,
          away_team_id: newMatchAwayTeam,
          league_id: newMatchLeague,
          match_date: newMatchDate,
          venue: newMatchVenue,
          admin_id: newMatchAdmin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Match created successfully!');
        setNewMatchHomeTeam('');
        setNewMatchAwayTeam('');
        setNewMatchLeague('');
        setNewMatchDate('');
        setNewMatchVenue('');
        setNewMatchAdmin('');
        setActiveMatchSubTab('existing'); // Switch back to existing matches tab
        fetchMatches(token); // Refresh the list
      } else {
        alert(`Failed to create match: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match. Please check console for details.');
    }
  };

  const handleDeleteMatch = async (matchId, token) => {
    if (!window.confirm('Are you sure you want to delete this match?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/v1/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Match deleted successfully!');
        fetchMatches(token); // Refresh the list
      } else {
        alert(`Failed to delete match: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Error deleting match. Please check console for details.');
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setEditedMatchHomeTeam(match.home_team_id);
    setEditedMatchAwayTeam(match.away_team_id);
    setEditedMatchLeague(match.league_id);
    setEditedMatchDate(match.match_date.substring(0, 16)); // Format for datetime-local input
    setEditedMatchVenue(match.venue);
    setEditedMatchStatus(match.status);
    setEditedMatchAdmin(match.admin_id);
  };

  const handleUpdateMatch = async (token) => {
    if (!editingMatch) return;

    try {
      const response = await fetch(`http://localhost:5001/api/v1/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          home_team_id: editedMatchHomeTeam,
          away_team_id: editedMatchAwayTeam,
          league_id: editedMatchLeague,
          match_date: editedMatchDate,
          venue: editedMatchVenue,
          status: editedMatchStatus,
          admin_id: editedMatchAdmin,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Match updated successfully!');
        setEditingMatch(null);
        fetchMatches(token); // Refresh the list
      } else {
        alert(`Failed to update match: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Error updating match. Please check console for details.');
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMatches(token); // Pass token
        fetchTeams(token);   // Pass token
        fetchLeagues(token); // Pass token
        fetchAdmins(token);  // Pass token
    }
  }, [user, token, fetchMatches, fetchTeams, fetchLeagues, fetchAdmins]);

  return (
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      {selectedLiveMatch ? (
        <LiveMatchAdmin matchData={selectedLiveMatch} onBack={() => setSelectedLiveMatch(null)} matchStats={matchStats} />
      ) : (
        <>
          <h3>Match Management</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveMatchSubTab('existing')}
              style={{
                backgroundColor: activeMatchSubTab === 'existing' ? '#2980b9' : '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Existing Matches
            </button>
            {user && user.role === 'super_admin' && (
              <button
                onClick={() => setActiveMatchSubTab('create')}
                style={{
                  backgroundColor: activeMatchSubTab === 'create' ? '#2980b9' : '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Match
              </button>
            )}
          </div>

          {activeMatchSubTab === 'existing' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Home Team</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Away Team</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>League</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Date</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Venue</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Status</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Score</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Minute</th>
                <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Admin</th>
                <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id}>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{match.id}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getTeamName(match.home_team_id)}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getTeamName(match.away_team_id)}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getLeagueName(match.league_id)}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{new Date(match.match_date).toLocaleString()}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{match.venue}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{match.status}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{match.home_score} - {match.away_score}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{match.minute}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getAdminName(match.admin_id)}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                      {(user && (user.role === 'super_admin' || user.role === 'match_day_operator')) && (
                        <button onClick={() => handleEditMatch(match)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                      )}
                      {user && user.role === 'match_day_operator' && (match.status === 'LIVE' || match.status === 'SCHEDULED') && (
                        <button onClick={() => {
                          const homeTeam = teams.find(t => t.id === match.home_team_id);
                          const awayTeam = teams.find(t => t.id === match.away_team_id);
                          setSelectedLiveMatch({
                            ...match,
                            home_team_name: homeTeam ? homeTeam.name : 'Unknown Home Team',
                            away_team_name: awayTeam ? awayTeam.name : 'Unknown Away Team',
                            home_team_logo: homeTeam ? `http://localhost:5001${homeTeam.logo_url}` : '',
                            away_team_logo: awayTeam ? `http://localhost:5001${awayTeam.logo_url}` : '',
                          });
                        }} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Manage Live</button>
                      )}
                      {user && user.role === 'super_admin' && (
                        <button onClick={() => handleDeleteMatch(match.id, token)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeMatchSubTab === 'create' && user && user.role === 'super_admin' && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
              <h4>Create New Match</h4>
              <select
                value={newMatchHomeTeam}
                onChange={(e) => setNewMatchHomeTeam(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4a5568',
                  backgroundColor: '#34495e',
                  color: 'white'
                }}
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={newMatchAwayTeam}
                onChange={(e) => setNewMatchAwayTeam(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4a5568',
                  backgroundColor: '#34495e',
                  color: 'white'
                }}
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={newMatchLeague}
                onChange={(e) => setNewMatchLeague(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4a5568',
                  backgroundColor: '#34495e',
                  color: 'white'
                }}
              >
                <option value="">Select League</option>
                {leagues.map(league => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>
              <input 
                type="datetime-local" 
                value={newMatchDate} 
                onChange={(e) => setNewMatchDate(e.target.value)} 
                style={{ 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #4a5568', 
                  backgroundColor: '#34495e',
                  color: 'white'
                }} 
              />
              <select
                value={newMatchVenue}
                onChange={(e) => setNewMatchVenue(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4a5568',
                  backgroundColor: '#34495e',
                  color: 'white'
                }}
              >
                <option value="">Select Venue</option>
                {stadiums.map(stadium => (
                  <option key={stadium} value={stadium}>{stadium}</option>
                ))}
              </select>
              <select
                value={newMatchAdmin}
                onChange={(e) => setNewMatchAdmin(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #4a5568',
                  backgroundColor: '#34495e',
                  color: 'white'
                }}
              >
                <option value="">Select Admin</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                ))}
              </select>
              <button 
                onClick={() => handleCreateMatch(token)}
                style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 15px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create Match
              </button>
            </div>
          )}

          {editingMatch && (
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <h4>Edit Match: {getTeamName(editingMatch.home_team_id)} vs {getTeamName(editingMatch.away_team_id)}</h4>
                <select
                  value={editedMatchHomeTeam}
                  onChange={(e) => setEditedMatchHomeTeam(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select Home Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select
                  value={editedMatchAwayTeam}
                  onChange={(e) => setEditedMatchAwayTeam(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select Away Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select
                  value={editedMatchLeague}
                  onChange={(e) => setEditedMatchLeague(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select League</option>
                  {leagues.map(league => (
                    <option key={league.id} value={league.id}>{league.name}</option>
                  ))}
                </select>
                <input 
                  type="datetime-local" 
                  value={editedMatchDate} 
                  onChange={(e) => setEditedMatchDate(e.target.value)} 
                  disabled={user.role === 'match_day_operator'}
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #4a5568', 
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }} 
                />
                <select
                  value={editedMatchVenue}
                  onChange={(e) => setEditedMatchVenue(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select Venue</option>
                  {stadiums.map(stadium => (
                    <option key={stadium} value={stadium}>{stadium}</option>
                  ))}
                </select>
                <select
                  value={editedMatchStatus}
                  onChange={(e) => setEditedMatchStatus(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="LIVE">LIVE</option>
                  <option value="FINISHED">FINISHED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
                <select
                  value={editedMatchAdmin}
                  onChange={(e) => setEditedMatchAdmin(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #4a5568',
                    backgroundColor: '#2c3e50',
                    color: 'white'
                  }}
                >
                  <option value="">Select Admin</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                  ))}
                </select>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    onClick={() => setEditingMatch(null)}
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
                    onClick={() => handleUpdateMatch(token)}
                    style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 15px', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MatchManagement;