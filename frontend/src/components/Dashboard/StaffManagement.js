import React, { useState, useEffect } from 'react';

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [activeStaffSubTab, setActiveStaffSubTab] = useState('existing'); // Default to existing staff

  // State for new staff form
  const [newStaffName, setNewStaffName] = useState('');
  const [selectedStaffImageFile, setSelectedStaffImageFile] = useState(null);
  const [newStaffTeam, setNewStaffTeam] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffNationality, setNewStaffNationality] = useState('');

  // State for editing staff form
  const [editingStaff, setEditingStaff] = useState(null);
  const [editedStaffName, setEditedStaffName] = useState('');
  const [editedStaffTeam, setEditedStaffTeam] = useState('');
  const [editedStaffRole, setEditedStaffRole] = useState('');
  const [editedStaffNationality, setEditedStaffNationality] = useState('');
  const [editedStaffImageUrl, setEditedStaffImageUrl] = useState('');

  const staffRoles = [
    'Manager', 'Assistant Coach', 'Goalkeeping Coach', 'Fitness Coach', 'Doctor', 'Physiotherapist', 'Analyst', 'Scout', 'Team Coordinator',
  ];

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/staff', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStaff(data);
      } else {
        console.error('Failed to fetch staff:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
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

  const handleCreateStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      let image_url = '';

      if (selectedStaffImageFile) {
        const formData = new FormData();
        formData.append('logo', selectedStaffImageFile);

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

      const response = await fetch('http://localhost:5001/api/v1/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: newStaffName,
          team_id: newStaffTeam,
          role: newStaffRole,
          nationality: newStaffNationality,
          image_url: image_url,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Staff member created successfully!');
        setNewStaffName('');
        setNewStaffTeam('');
        setNewStaffRole('');
        setNewStaffNationality('');
        setSelectedStaffImageFile(null);
        setActiveStaffSubTab('existing'); // Switch back to existing staff tab
        fetchStaff(); // Refresh the list
      } else {
        alert(`Failed to create staff member: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating staff member:', error);
      alert('Error creating staff member. Please check console for details.');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('Staff member deleted successfully!');
        fetchStaff(); // Refresh the list
      } else {
        alert(`Failed to delete staff member: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Error deleting staff member. Please check console for details.');
    }
  };

  const handleEditStaff = (member) => {
    setEditingStaff(member);
    setEditedStaffName(member.name);
    setEditedStaffTeam(member.team_id);
    setEditedStaffRole(member.role);
    setEditedStaffNationality(member.nationality);
    setEditedStaffImageUrl(member.image_url); // Set existing image URL
    setSelectedStaffImageFile(null); // Clear selected file when editing a new staff member
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    try {
      const token = localStorage.getItem('token');
      let image_url = editedStaffImageUrl;

      if (selectedStaffImageFile) {
        const formData = new FormData();
        formData.append('logo', selectedStaffImageFile);

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

      const response = await fetch(`http://localhost:5001/api/v1/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: editedStaffName,
          team_id: editedStaffTeam,
          role: editedStaffRole,
          nationality: editedStaffNationality,
          image_url: image_url,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Staff member updated successfully!');
        setEditingStaff(null);
        fetchStaff(); // Refresh the list
      } else {
        alert(`Failed to update staff member: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating staff member:', error);
      alert('Error updating staff member. Please check console for details.');
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchTeams();
    fetchCountries();
  }, []);

  return (
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      <h3>Staff Management</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveStaffSubTab('existing')}
          style={{
            backgroundColor: activeStaffSubTab === 'existing' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Existing Staff
        </button>
        <button
          onClick={() => setActiveStaffSubTab('create')}
          style={{
            backgroundColor: activeStaffSubTab === 'create' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Create Staff
        </button>
      </div>

      {activeStaffSubTab === 'existing' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Image</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Team</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Role</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Nationality</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{member.id}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{member.name}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                  {member.image_url && <img src={`http://localhost:5001${member.image_url}`} alt={member.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />}
                </td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getTeamName(member.team_id)}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{member.role}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{member.nationality}</td>
              <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                <button onClick={() => handleEditStaff(member)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDeleteStaff(member.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      {activeStaffSubTab === 'create' && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
          <h4>Create New Staff Member</h4>
          <input 
            type="text" 
            placeholder="Staff Name" 
            value={newStaffName} 
            onChange={(e) => setNewStaffName(e.target.value)} 
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
            onChange={(e) => setSelectedStaffImageFile(e.target.files[0])} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <select
            value={newStaffTeam}
            onChange={(e) => setNewStaffTeam(e.target.value)}
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
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#34495e',
              color: 'white'
            }}
          >
            <option value="">Select Role</option>
            {staffRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={newStaffNationality}
            onChange={(e) => setNewStaffNationality(e.target.value)}
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
            onClick={handleCreateStaff}
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
            Create Staff Member
          </button>
        </div>
      )}

      {editingStaff && (
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
            <h4>Edit Staff Member: {editingStaff.name}</h4>
            <input 
              type="text" 
              placeholder="Staff Name" 
              value={editedStaffName} 
              onChange={(e) => setEditedStaffName(e.target.value)} 
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
            onChange={(e) => setSelectedStaffImageFile(e.target.files[0])} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
            {editedStaffImageUrl && ( // Display current image if available
              <img src={`http://localhost:5001${editedStaffImageUrl}`} alt="Current Staff" style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '10px' }} />
            )}
            <select
              value={editedStaffTeam}
              onChange={(e) => setEditedStaffTeam(e.target.value)}
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
              value={editedStaffRole}
              onChange={(e) => setEditedStaffRole(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#2c3e50',
                color: 'white'
              }}
            >
              <option value="">Select Role</option>
              {staffRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={editedStaffNationality}
              onChange={(e) => setEditedStaffNationality(e.target.value)}
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
                onClick={() => setEditingStaff(null)}
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
                onClick={handleUpdateStaff}
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

export default StaffManagement;
