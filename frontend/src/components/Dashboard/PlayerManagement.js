import React, { useState, useEffect } from 'react';

function PlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activePlayerSubTab, setActivePlayerSubTab] = useState('existing'); // Default to existing players

  // State for new player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPlayerImageFile, setSelectedPlayerImageFile] = useState(null);
  const [newPlayerTeam, setNewPlayerTeam] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [newPlayerJerseyNumber, setNewPlayerJerseyNumber] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [newPlayerNationality, setNewPlayerNationality] = useState('');

  // State for editing player
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');
  const [editedPlayerTeam, setEditedPlayerTeam] = useState('');
  const [editedPlayerPosition, setEditedPlayerPosition] = useState('');
  const [editedPlayerJerseyNumber, setEditedPlayerJerseyNumber] = useState('');
  const [editedPlayerAge, setEditedPlayerAge] = useState('');
  const [editedPlayerNationality, setEditedPlayerNationality] = useState('');
  const [editedPlayerImageUrl, setEditedPlayerImageUrl] = useState('');

  const positions = [
    'Goalkeeper', 'Centre-Back', 'Full-Back', 'Wing-Back', 'Defensive Midfielder',
    'Central Midfielder', 'Attacking Midfielder', 'Winger', 'Striker',
  ];

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

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/teams', {
        headers: {
          'x-auth-token': token,
        },
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
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/data/countries');
      const data = await response.json();
      if (response.ok) {
        setCountries(data);
      } else {
        console.error('Failed to fetch countries:', data.msg);
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const handleCreatePlayer = async () => {
    try {
      const token = localStorage.getItem('token');
      let image_url = '';

      if (selectedPlayerImageFile) {
        const formData = new FormData();
        formData.append('logo', selectedPlayerImageFile);

        const uploadResponse = await fetch('http://localhost:5001/api/v1/upload/logo', {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          image_url = uploadData.filePath;
        } else {
          alert(`Failed to upload image: ${uploadData.msg}`);
          return; // Stop creation if image upload fails
        }
      }

      const response = await fetch('http://localhost:5001/api/v1/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: newPlayerName,
          team_id: newPlayerTeam,
          position: newPlayerPosition,
          jersey_number: newPlayerJerseyNumber,
          age: newPlayerAge,
          nationality: newPlayerNationality,
          image_url: image_url,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player created successfully!');
        setNewPlayerName('');
        setNewPlayerTeam('');
        setNewPlayerPosition('');
        setNewPlayerJerseyNumber('');
        setNewPlayerAge('');
        setNewPlayerNationality('');
        setSelectedPlayerImageFile(null);
        setActivePlayerSubTab('existing'); // Switch back to existing players tab
        fetchPlayers(); // Refresh the list
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player deleted successfully!');
        fetchPlayers(); // Refresh the list
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
    setEditedPlayerTeam(player.team_id);
    setEditedPlayerPosition(player.position);
    setEditedPlayerJerseyNumber(player.jersey_number);
    setEditedPlayerAge(player.age);
    setEditedPlayerNationality(player.nationality);
    setEditedPlayerImageUrl(player.image_url); // Set existing image URL
    setSelectedPlayerImageFile(null); // Clear selected file when editing a new player
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;

    try {
      const token = localStorage.getItem('token');
      let image_url = editedPlayerImageUrl;

      if (selectedPlayerImageFile) {
        const formData = new FormData();
        formData.append('logo', selectedPlayerImageFile);

        const uploadResponse = await fetch('http://localhost:5001/api/v1/upload/logo', {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          image_url = uploadData.filePath;
        } else {
          alert(`Failed to upload image: ${uploadData.msg}`);
          return; // Stop update if image upload fails
        }
      }

      const response = await fetch(`http://localhost:5001/api/v1/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: editedPlayerName,
          team_id: editedPlayerTeam,
          position: editedPlayerPosition,
          jersey_number: editedPlayerJerseyNumber,
          age: editedPlayerAge,
          nationality: editedPlayerNationality,
          image_url: image_url,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Player updated successfully!');
        setEditingPlayer(null);
        fetchPlayers(); // Refresh the list
      } else {
        alert(`Failed to update player: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player. Please check console for details.');
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    fetchCountries();
  }, []);

  return (
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      <h3>Player Management</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActivePlayerSubTab('existing')}
          style={{
            backgroundColor: activePlayerSubTab === 'existing' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Existing Players
        </button>
        <button
          onClick={() => setActivePlayerSubTab('create')}
          style={{
            backgroundColor: activePlayerSubTab === 'create' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Create Player
        </button>
      </div>

      {activePlayerSubTab === 'existing' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Image</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Team</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Position</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Jersey Number</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Age</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Nationality</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.id}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.name}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                  {player.image_url && <img src={`http://localhost:5001${player.image_url}`} alt={player.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />}
                </td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getTeamName(player.team_id)}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.position}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.jersey_number}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.age}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{player.nationality}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                <button onClick={() => handleEditPlayer(player)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDeletePlayer(player.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      {activePlayerSubTab === 'create' && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
          <h4>Create New Player</h4>
          <input 
            type="text" 
            placeholder="Player Name" 
            value={newPlayerName} 
            onChange={(e) => setNewPlayerName(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setSelectedPlayerImageFile(e.target.files[0])} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <select
            value={newPlayerTeam}
            onChange={(e) => setNewPlayerTeam(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <select
            value={newPlayerPosition}
            onChange={(e) => setNewPlayerPosition(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Position</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Jersey Number" 
            value={newPlayerJerseyNumber} 
            onChange={(e) => setNewPlayerJerseyNumber(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <input 
            type="number" 
            placeholder="Age" 
            value={newPlayerAge} 
            onChange={(e) => setNewPlayerAge(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <select
            value={newPlayerNationality}
            onChange={(e) => setNewPlayerNationality(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Nationality</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <button 
            onClick={handleCreatePlayer}
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
            Create Player
          </button>
        </div>
      )}

      {editingPlayer && (
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
            <h4>Edit Player: {editingPlayer.name}</h4>
            <input 
              type="text" 
              placeholder="Player Name" 
              value={editedPlayerName} 
              onChange={(e) => setEditedPlayerName(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setSelectedPlayerImageFile(e.target.files[0])} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            {editedPlayerImageUrl && ( // Display current image if available
              <img src={`http://localhost:5001${editedPlayerImageUrl}`} alt="Current Player" style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '10px' }} />
            )}
            <select
              value={editedPlayerTeam}
              onChange={(e) => setEditedPlayerTeam(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <select
              value={editedPlayerPosition}
              onChange={(e) => setEditedPlayerPosition(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Position</option>
              {positions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Jersey Number" 
              value={editedPlayerJerseyNumber} 
              onChange={(e) => setEditedPlayerJerseyNumber(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <input 
              type="number" 
              placeholder="Age" 
              value={editedPlayerAge} 
              onChange={(e) => setEditedPlayerAge(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <select
              value={editedPlayerNationality}
              onChange={(e) => setEditedPlayerNationality(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Nationality</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setEditingPlayer(null)}
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
                onClick={handleUpdatePlayer}
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

export default PlayerManagement;
