import React, { useState, useEffect, useCallback } from 'react';
import './TeamManagement.css';

function TeamManagement({ token }) {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [activeTeamSubTab, setActiveTeamSubTab] = useState('existing');

  // Form state
  const [teamName, setTeamName] = useState('');
  const [teamLeague, setTeamLeague] = useState('');
  const [teamStadium, setTeamStadium] = useState('');
  const [teamLogo, setTeamLogo] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/teams', {
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      if (response.ok) {
        setTeams(data);
      } else {
        console.error('Failed to fetch teams:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, [token]);

  const fetchLeagues = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/leagues', {
        headers: { 'x-auth-token': token },
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

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, [fetchTeams, fetchLeagues]);

  const getLeagueName = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', teamName);
    formData.append('league_id', teamLeague);
    formData.append('stadium', teamStadium);
    if (teamLogo) {
      formData.append('logo', teamLogo);
    }

    try {
      const response = await fetch('http://localhost:5001/api/v1/teams', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team created successfully!');
        setTeamName('');
        setTeamLeague('');
        setTeamStadium('');
        setTeamLogo(null);
        setActiveTeamSubTab('existing');
        fetchTeams();
      } else {
        alert(`Failed to create team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/v1/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team deleted successfully!');
        fetchTeams();
      } else {
        alert(`Failed to delete team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamLeague(team.league_id);
    setTeamStadium(team.stadium);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editingTeam) return;

    const formData = new FormData();
    formData.append('name', teamName);
    formData.append('league_id', teamLeague);
    formData.append('stadium', teamStadium);
    if (teamLogo) {
      formData.append('logo', teamLogo);
    }

    try {
      const response = await fetch(`http://localhost:5001/api/v1/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team updated successfully!');
        setEditingTeam(null);
        setTeamName('');
        setTeamLeague('');
        setTeamStadium('');
        setTeamLogo(null);
        fetchTeams();
      } else {
        alert(`Failed to update team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  return (
    <div className="team-management-container">
      <h3>Team Management</h3>
      <div className="sub-tab-buttons">
        <button
          onClick={() => setActiveTeamSubTab('existing')}
          className={`tab-button ${activeTeamSubTab === 'existing' ? 'active' : ''}`}
        >
          Existing Teams
        </button>
        <button
          onClick={() => setActiveTeamSubTab('create')}
          className={`tab-button ${activeTeamSubTab === 'create' ? 'active' : ''}`}
        >
          Create Team
        </button>
      </div>

      {activeTeamSubTab === 'existing' && (
        <table className="teams-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Name</th>
              <th>League</th>
              <th>Stadium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td>{team.id}</td>
                <td><img src={`http://localhost:5001${team.logo_url}`} alt={team.name} className="team-logo-sm" /></td>
                <td>{team.name}</td>
                <td>{getLeagueName(team.league_id)}</td>
                <td>{team.stadium}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEditTeam(team)} className="action-button edit-button">Edit</button>
                    <button onClick={() => handleDeleteTeam(team.id)} className="action-button delete-button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTeamSubTab === 'create' && (
        <form onSubmit={handleCreateTeam} className="form-container">
          <h4>Create New Team</h4>
          <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="form-input" />
          <select value={teamLeague} onChange={(e) => setTeamLeague(e.target.value)} className="form-select">
            <option value="">Select League</option>
            {leagues.map(league => <option key={league.id} value={league.id}>{league.name}</option>)}
          </select>
          <input type="text" placeholder="Stadium" value={teamStadium} onChange={(e) => setTeamStadium(e.target.value)} className="form-input" />
          <input type="file" onChange={(e) => setTeamLogo(e.target.files[0])} className="form-input" />
          <button type="submit" className="create-button">Create Team</button>
        </form>
      )}

      {editingTeam && (
        <div className="modal-overlay">
          <form onSubmit={handleUpdateTeam} className="form-container">
            <h4>Edit Team: {editingTeam.name}</h4>
            <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="form-input" />
            <select value={teamLeague} onChange={(e) => setTeamLeague(e.target.value)} className="form-select">
              <option value="">Select League</option>
              {leagues.map(league => <option key={league.id} value={league.id}>{league.name}</option>)}
            </select>
            <input type="text" placeholder="Stadium" value={teamStadium} onChange={(e) => setTeamStadium(e.target.value)} className="form-input" />
            <input type="file" onChange={(e) => setTeamLogo(e.target.files[0])} className="form-input" />
            <div className="action-buttons">
              <button type="button" onClick={() => setEditingTeam(null)} className="action-button delete-button">Cancel</button>
              <button type="submit" className="action-button edit-button">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;