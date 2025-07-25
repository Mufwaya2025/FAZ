import React, { useState, useEffect, useCallback } from 'react';
import './PlayerManagement.css';

function PlayerManagement({ token }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activePlayerSubTab, setActivePlayerSubTab] = useState('existing');

  // State for new player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('');
  const [newPlayerNationality, setNewPlayerNationality] = useState('');

  // State for editing player
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');
  const [editedPlayerPosition, setEditedPlayerPosition] = useState('');
  const [editedPlayerTeam, setEditedPlayerTeam] = useState('');
  const [editedPlayerNationality, setEditedPlayerNationality] = useState('');

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/players', {
        headers: { 'x-auth-token': token },
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
  }, [token]);

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

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const handleCreatePlayer = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: newPlayerName,
          position: newPlayerPosition,
          team_id: newPlayerTeam,
          nationality: newPlayerNationality,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player created successfully!');
        setNewPlayerName('');
        setNewPlayerPosition('');
        setNewPlayerTeam('');
        setNewPlayerNationality('');
        setActivePlayerSubTab('existing');
        fetchPlayers();
      } else {
        alert(`Failed to create player: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error creating player. Please check console for details.');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/v1/players/${playerId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player deleted successfully!');
        fetchPlayers();
      } else {
        alert(`Failed to delete player: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error deleting player. Please check console for details.');
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setEditedPlayerName(player.name);
    setEditedPlayerPosition(player.position);
    setEditedPlayerTeam(player.team_id);
    setEditedPlayerNationality(player.nationality);
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;

    try {
      const response = await fetch(`http://localhost:5001/api/v1/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: editedPlayerName,
          position: editedPlayerPosition,
          team_id: editedPlayerTeam,
          nationality: editedPlayerNationality,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player updated successfully!');
        setEditingPlayer(null);
        fetchPlayers();
      } else {
        alert(`Failed to update player: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player. Please check console for details.');
    }
  };

  return (
    <div className="player-management-container">
      <h3>Player Management</h3>
      <div className="sub-tab-buttons">
        <button
          onClick={() => setActivePlayerSubTab('existing')}
          className={`tab-button ${activePlayerSubTab === 'existing' ? 'active' : ''}`}
        >
          Existing Players
        </button>
        <button
          onClick={() => setActivePlayerSubTab('create')}
          className={`tab-button ${activePlayerSubTab === 'create' ? 'active' : ''}`}
        >
          Create Player
        </button>
      </div>

      {activePlayerSubTab === 'existing' && (
        <table className="players-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Team</th>
              <th>Nationality</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.name}</td>
                <td>{player.position}</td>
                <td>{getTeamName(player.team_id)}</td>
                <td>{player.nationality}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEditPlayer(player)} className="action-button edit-button">Edit</button>
                    <button onClick={() => handleDeletePlayer(player.id)} className="action-button delete-button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activePlayerSubTab === 'create' && (
        <div className="form-container">
          <h4>Create New Player</h4>
          <input
            type="text"
            placeholder="Name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Position"
            value={newPlayerPosition}
            onChange={(e) => setNewPlayerPosition(e.target.value)}
            className="form-input"
          />
          <select
            value={newPlayerTeam}
            onChange={(e) => setNewPlayerTeam(e.target.value)}
            className="form-select"
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nationality"
            value={newPlayerNationality}
            onChange={(e) => setNewPlayerNationality(e.target.value)}
            className="form-input"
          />
          <button onClick={handleCreatePlayer} className="create-button">Create Player</button>
        </div>
      )}

      {editingPlayer && (
        <div className="modal-overlay">
          <div className="form-container">
            <h4>Edit Player: {editingPlayer.name}</h4>
            <input
              type="text"
              placeholder="Name"
              value={editedPlayerName}
              onChange={(e) => setEditedPlayerName(e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Position"
              value={editedPlayerPosition}
              onChange={(e) => setEditedPlayerPosition(e.target.value)}
              className="form-input"
            />
            <select
              value={editedPlayerTeam}
              onChange={(e) => setEditedPlayerTeam(e.target.value)}
              className="form-select"
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nationality"
              value={editedPlayerNationality}
              onChange={(e) => setEditedPlayerNationality(e.target.value)}
              className="form-input"
            />
            <div className="action-buttons">
              <button onClick={() => setEditingPlayer(null)} className="action-button delete-button">Cancel</button>
              <button onClick={handleUpdatePlayer} className="action-button edit-button">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerManagement;
