import React, { useState, useEffect } from 'react';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [activeTeamSubTab, setActiveTeamSubTab] = useState('existing'); // Default to existing teams

  // State for new team form
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [newTeamLeague, setNewTeamLeague] = useState('');
  const [newTeamFoundedYear, setNewTeamFoundedYear] = useState('');
  const [newTeamStadium, setNewTeamStadium] = useState('');

  // State for editing team
  const [editingTeam, setEditingTeam] = useState(null);
  const [editedTeamName, setEditedTeamName] = useState('');
  const [editedTeamLogoUrl, setEditedTeamLogoUrl] = useState('');
  const [editedTeamLeague, setEditedTeamLeague] = useState('');
  const [editedTeamFoundedYear, setEditedTeamFoundedYear] = useState('');
  const [editedTeamStadium, setEditedTeamStadium] = useState('');

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
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const getLeagueName = (leagueId) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  const handleCreateTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      let logo_url = '';

      if (selectedLogoFile) {
        const formData = new FormData();
        formData.append('logo', selectedLogoFile);

        const uploadResponse = await fetch('http://localhost:5001/api/v1/upload/logo', {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          logo_url = uploadData.filePath;
        } else {
          alert(`Failed to upload logo: ${uploadData.msg}`);
          return; // Stop creation if logo upload fails
        }
      }

      const response = await fetch('http://localhost:5001/api/v1/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: newTeamName,
          logo_url: logo_url,
          league_id: newTeamLeague,
          founded_year: newTeamFoundedYear,
          stadium: newTeamStadium,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team created successfully!');
        setNewTeamName('');
        setSelectedLogoFile(null);
        setNewTeamLeague('');
        setNewTeamFoundedYear('');
        setNewTeamStadium('');
        setActiveTeamSubTab('existing'); // Switch back to existing teams tab
        fetchTeams(); // Refresh the list
      } else {
        alert(`Failed to create team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team. Please check console for details.');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team deleted successfully!');
        fetchTeams(); // Refresh the list
      } else {
        alert(`Failed to delete team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team. Please check console for details.');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setEditedTeamName(team.name);
    setEditedTeamLogoUrl(team.logo_url);
    setEditedTeamLeague(team.league_id);
    setEditedTeamFoundedYear(team.founded_year);
    setEditedTeamStadium(team.stadium);
    setSelectedLogoFile(null); // Clear selected file when editing a new team
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    try {
      const token = localStorage.getItem('token');
      let logo_url = editedTeamLogoUrl;

      if (selectedLogoFile) {
        const formData = new FormData();
        formData.append('logo', selectedLogoFile);

        const uploadResponse = await fetch('http://localhost:5001/api/v1/upload/logo', {
          method: 'POST',
          headers: {
            'x-auth-token': token,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          logo_url = uploadData.filePath;
        } else {
          alert(`Failed to upload logo: ${uploadData.msg}`);
          return; // Stop update if logo upload fails
        }
      }

      const response = await fetch(`http://localhost:5001/api/v1/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: editedTeamName,
          logo_url: logo_url,
          league_id: editedTeamLeague,
          founded_year: editedTeamFoundedYear,
          stadium: editedTeamStadium,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Team updated successfully!');
        setEditingTeam(null);
        fetchTeams(); // Refresh the list
      } else {
        alert(`Failed to update team: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Error updating team. Please check console for details.');
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1800; i--) {
      years.push(i);
    }
    return years;
  };

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, []);

  return (
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      <h3>Team Management</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTeamSubTab('existing')}
          style={{
            backgroundColor: activeTeamSubTab === 'existing' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Existing Teams
        </button>
        <button
          onClick={() => setActiveTeamSubTab('create')}
          style={{
            backgroundColor: activeTeamSubTab === 'create' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Create Team
        </button>
      </div>

      {activeTeamSubTab === 'existing' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Logo</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>League</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Founded Year</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Stadium</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{team.id}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{team.name}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                  {team.logo_url && <img src={`http://localhost:5001${team.logo_url}`} alt={team.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />}
                </td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getLeagueName(team.league_id)}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{team.founded_year}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{team.stadium}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                  <button onClick={() => handleEditTeam(team)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDeleteTeam(team.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTeamSubTab === 'create' && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
          <h4>Create New Team</h4>
          <input 
            type="text" 
            placeholder="Team Name" 
            value={newTeamName} 
            onChange={(e) => setNewTeamName(e.target.value)} 
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
            onChange={(e) => setSelectedLogoFile(e.target.files[0])} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <select
            value={newTeamLeague}
            onChange={(e) => setNewTeamLeague(e.target.value)}
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
          <select
            value={newTeamFoundedYear}
            onChange={(e) => setNewTeamFoundedYear(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Founded Year</option>
            {generateYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Stadium" 
            value={newTeamStadium} 
            onChange={(e) => setNewTeamStadium(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <button 
            onClick={handleCreateTeam}
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
            Create Team
          </button>
        </div>
      )}

      {editingTeam && (
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
            <h4>Edit Team: {editingTeam.name}</h4>
            <input 
              type="text" 
              placeholder="Team Name" 
              value={editedTeamName} 
              onChange={(e) => setEditedTeamName(e.target.value)} 
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
              onChange={(e) => setSelectedLogoFile(e.target.files[0])} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            {editedTeamLogoUrl && ( // Display current logo if available
              <img src={`http://localhost:5001${editedTeamLogoUrl}`} alt="Current Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '10px' }} />
            )}
            <select
              value={editedTeamLeague}
              onChange={(e) => setEditedTeamLeague(e.target.value)}
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
            <select
              value={editedTeamFoundedYear}
              onChange={(e) => setEditedTeamFoundedYear(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Founded Year</option>
              {generateYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Stadium" 
              value={editedTeamStadium} 
              onChange={(e) => setEditedTeamStadium(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setEditingTeam(null)}
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
                onClick={handleUpdateTeam}
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

export default TeamManagement;