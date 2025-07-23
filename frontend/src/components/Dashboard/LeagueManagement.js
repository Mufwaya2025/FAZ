import React, { useState, useEffect } from 'react';
import './LeagueManagement.css';
import { Edit, Trash2 } from 'lucide-react';

function LeagueManagement() {
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueCountry, setNewLeagueCountry] = useState('');
  const [newLeagueSeason, setNewLeagueSeason] = useState('');
  const [editingLeague, setEditingLeague] = useState(null);
  const [editedLeagueName, setEditedLeagueName] = useState('');
  const [editedLeagueCountry, setEditedLeagueCountry] = useState('');
  const [editedLeagueSeason, setEditedLeagueSeason] = useState('');

  const fetchLeagues = async () => {
    try {
      const token = localStorage.getItem('token');
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
        setLeagues([
          {id: 1, name: 'Premier League', country: 'England', season: '2024/2025'},
          {id: 2, name: 'La Liga', country: 'Spain', season: '2024/2025'}
        ]);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setLeagues([
        {id: 1, name: 'Premier League', country: 'England', season: '2024/2025'},
        {id: 2, name: 'La Liga', country: 'Spain', season: '2024/2025'}
      ]);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/data/countries');
      const data = await response.json();
      if (response.ok) {
        setCountries(data);
      } else {
        console.error('Failed to fetch countries:', data.msg);
        setCountries([]); // Set to empty array on failure
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]); // Set to empty array on error
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/data/seasons');
      const data = await response.json();
      if (response.ok) {
        setSeasons(data);
      } else {
        console.error('Failed to fetch seasons:', data.msg);
        setSeasons([]); // Set to empty array on failure
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      setSeasons([]); // Set to empty array on error
    }
  };

  const handleCreateLeague = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: newLeagueName, country: newLeagueCountry, season: newLeagueSeason }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('League created successfully!');
        setNewLeagueName('');
        setNewLeagueCountry('');
        setNewLeagueSeason('');
        setShowCreateForm(false);
        fetchLeagues(); // Refresh the list
      } else {
        alert(`Failed to create league: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Error creating league. Please check console for details.');
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!window.confirm('Are you sure you want to delete this league?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/leagues/${leagueId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('League deleted successfully!');
        fetchLeagues(); // Refresh the list
      } else {
        alert(`Failed to delete league: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Error deleting league. Please check console for details.');
    }
  };

  const handleEditLeague = (league) => {
    setEditingLeague(league);
    setEditedLeagueName(league.name);
    setEditedLeagueCountry(league.country);
    setEditedLeagueSeason(league.season);
  };

  const handleUpdateLeague = async () => {
    if (!editingLeague) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/leagues/${editingLeague.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: editedLeagueName, country: editedLeagueCountry, season: editedLeagueSeason }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('League updated successfully!');
        setEditingLeague(null);
        fetchLeagues(); // Refresh the list
      } else {
        alert(`Failed to update league: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating league:', error);
      alert('Error updating league. Please check console for details.');
    }
  };

  useEffect(() => {
    fetchLeagues();
    fetchCountries();
    fetchSeasons();
  }, []);

  return (
    <div className="league-management-container">
      <div className="header">
        <h3>League Management</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-button"
        >
          {showCreateForm ? 'Cancel' : 'Create League'}
        </button>
      </div>

      {showCreateForm && (
        <div className="form-container">
          <h4>Create New League</h4>
          <input 
            type="text" 
            placeholder="League Name" 
            value={newLeagueName} 
            onChange={(e) => setNewLeagueName(e.target.value)} 
            className="form-input"
          />
          <select
            value={newLeagueCountry}
            onChange={(e) => setNewLeagueCountry(e.target.value)}
            className="form-select"
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <select
            value={newLeagueSeason}
            onChange={(e) => setNewLeagueSeason(e.target.value)}
            className="form-select"
          >
            <option value="">Select Season</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
          <button 
            onClick={handleCreateLeague}
            className="submit-button"
          >
            Submit
          </button>
        </div>
      )}

      <table className="leagues-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Country</th>
            <th>Season</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map(league => (
            <tr key={league.id}>
              <td>{league.id}</td>
              <td>{league.name}</td>
              <td>{league.country}</td>
              <td>{league.season}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleEditLeague(league)} className="action-button edit-button"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteLeague(league.id)} className="action-button delete-button"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingLeague && (
        <div className="modal-overlay">
          <div className="form-container" style={{ maxWidth: '400px' }}>
            <h4>Edit League: {editingLeague.name}</h4>
            <input 
              type="text" 
              placeholder="League Name" 
              value={editedLeagueName} 
              onChange={(e) => setEditedLeagueName(e.target.value)} 
              className="form-input"
            />
            <select
              value={editedLeagueCountry}
              onChange={(e) => setEditedLeagueCountry(e.target.value)}
              className="form-select"
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={editedLeagueSeason}
              onChange={(e) => setEditedLeagueSeason(e.target.value)}
              className="form-select"
            >
              <option value="">Select Season</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setEditingLeague(null)}
                className="action-button delete-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateLeague}
                className="action-button edit-button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeagueManagement;
