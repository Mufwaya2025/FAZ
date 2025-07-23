import React, { useState, useEffect } from 'react';

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
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>League Management</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create League'}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
          <h4>Create New League</h4>
          <input 
            type="text" 
            placeholder="League Name" 
            value={newLeagueName} 
            onChange={(e) => setNewLeagueName(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <select
            value={newLeagueCountry}
            onChange={(e) => setNewLeagueCountry(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <select
            value={newLeagueSeason}
            onChange={(e) => setNewLeagueSeason(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Season</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
          <button 
            onClick={handleCreateLeague}
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
            Submit
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Country</th>
            <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Season</th>
            <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map(league => (
            <tr key={league.id}>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{league.id}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{league.name}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{league.country}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{league.season}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                <button onClick={() => handleEditLeague(league)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDeleteLeague(league.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingLeague && (
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
            <h4>Edit League: {editingLeague.name}</h4>
            <input 
              type="text" 
              placeholder="League Name" 
              value={editedLeagueName} 
              onChange={(e) => setEditedLeagueName(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <select
              value={editedLeagueCountry}
              onChange={(e) => setEditedLeagueCountry(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={editedLeagueSeason}
              onChange={(e) => setEditedLeagueSeason(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Season</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setEditingLeague(null)}
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
                onClick={handleUpdateLeague}
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
    </div>
  );
}

export default LeagueManagement;
