import React, { useState, useEffect, useCallback } from 'react';
import LiveMatchAdmin from './LiveMatchAdmin';
import './MatchManagement.css';

function MatchManagement({ user, token }) {
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
      } else {
        console.error('Failed to fetch matches:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, []);

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
  }, []);

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
  }, []);

  const fetchAdmins = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/users', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const adminUsers = data.filter(user => user.role === 'match_day_operator' || user.role === 'super_admin');
        setAdmins(adminUsers);
      } else {
        console.error('Failed to fetch admins:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getLeagueName = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  const getAdminName = (adminId) => {
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
        setActiveMatchSubTab('existing');
        fetchMatches(token);
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
        fetchMatches(token);
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
    setEditedMatchDate(match.match_date.substring(0, 16));
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
        fetchMatches(token);
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
      fetchMatches(token);
      fetchTeams(token);
      fetchLeagues(token);
      fetchAdmins(token);
    }
  }, [user, token, fetchMatches, fetchTeams, fetchLeagues, fetchAdmins]);

  return (
    <div className="match-management-container">
      {selectedLiveMatch ? (
        <LiveMatchAdmin matchData={selectedLiveMatch} onBack={() => setSelectedLiveMatch(null)} />
      ) : (
        <>
          <h3>Match Management</h3>
          <div className="sub-tab-buttons">
            <button
              onClick={() => setActiveMatchSubTab('existing')}
              className={`tab-button ${activeMatchSubTab === 'existing' ? 'active' : ''}`}
            >
              Existing Matches
            </button>
            {user && user.role === 'super_admin' && (
              <button
                onClick={() => setActiveMatchSubTab('create')}
                className={`tab-button ${activeMatchSubTab === 'create' ? 'active' : ''}`}
              >
                Create Match
              </button>
            )}
          </div>

          {activeMatchSubTab === 'existing' && (
            <table className="matches-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Home Team</th>
                  <th>Away Team</th>
                  <th>League</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Minute</th>
                  <th>Admin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id}>
                    <td>{match.id}</td>
                    <td>{getTeamName(match.home_team_id)}</td>
                    <td>{getTeamName(match.away_team_id)}</td>
                    <td>{getLeagueName(match.league_id)}</td>
                    <td>{new Date(match.match_date).toLocaleString()}</td>
                    <td>{match.venue}</td>
                    <td>{match.status}</td>
                    <td>{match.home_score} - {match.away_score}</td>
                    <td>{match.minute}</td>
                    <td>{getAdminName(match.admin_id)}</td>
                    <td>
                      <div className="action-buttons">
                        {(user && (user.role === 'super_admin' || user.role === 'match_day_operator')) && (
                          <button onClick={() => handleEditMatch(match)} className="action-button edit-button">Edit</button>
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
                          }} className="action-button manage-live-button">Manage Live</button>
                        )}
                        {user && user.role === 'super_admin' && (
                          <button onClick={() => handleDeleteMatch(match.id, token)} className="action-button delete-button">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeMatchSubTab === 'create' && user && user.role === 'super_admin' && (
            <div className="form-container">
              <h4>Create New Match</h4>
              <select
                value={newMatchHomeTeam}
                onChange={(e) => setNewMatchHomeTeam(e.target.value)}
                className="form-select"
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={newMatchAwayTeam}
                onChange={(e) => setNewMatchAwayTeam(e.target.value)}
                className="form-select"
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={newMatchLeague}
                onChange={(e) => setNewMatchLeague(e.target.value)}
                className="form-select"
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
                className="form-input"
              />
              <select
                value={newMatchVenue}
                onChange={(e) => setNewMatchVenue(e.target.value)}
                className="form-select"
              >
                <option value="">Select Venue</option>
                {stadiums.map(stadium => (
                  <option key={stadium} value={stadium}>{stadium}</option>
                ))}
              </select>
              <select
                value={newMatchAdmin}
                onChange={(e) => setNewMatchAdmin(e.target.value)}
                className="form-select"
              >
                <option value="">Select Admin</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                ))}
              </select>
              <button 
                onClick={() => handleCreateMatch(token)}
                className="create-button"
              >
                Create Match
              </button>
            </div>
          )}

          {editingMatch && (
            <div className="modal-overlay">
              <div className="form-container">
                <h4>Edit Match: {getTeamName(editingMatch.home_team_id)} vs {getTeamName(editingMatch.away_team_id)}</h4>
                <select
                  value={editedMatchHomeTeam}
                  onChange={(e) => setEditedMatchHomeTeam(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  className="form-select"
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
                  className="form-select"
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
                  className="form-select"
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
                  className="form-input"
                />
                <select
                  value={editedMatchVenue}
                  onChange={(e) => setEditedMatchVenue(e.target.value)}
                  disabled={user.role === 'match_day_operator'}
                  className="form-select"
                >
                  <option value="">Select Venue</option>
                  {stadiums.map(stadium => (
                    <option key={stadium} value={stadium}>{stadium}</option>
                  ))}
                </select>
                <select
                  value={editedMatchStatus}
                  onChange={(e) => setEditedMatchStatus(e.target.value)}
                  className="form-select"
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
                  className="form-select"
                >
                  <option value="">Select Admin</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                  ))}
                </select>
                
                <div className="action-buttons">
                  <button 
                    onClick={() => setEditingMatch(null)}
                    className="action-button delete-button"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdateMatch(token)}
                    className="action-button edit-button"
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