import React, { useState, useEffect } from 'react';
import LeagueManagement from './Dashboard/LeagueManagement';
import MatchManagement from './Dashboard/MatchManagement';
import PlayerManagement from './Dashboard/PlayerManagement';
import StaffManagement from './Dashboard/StaffManagement';
import NewsManagement from './Dashboard/NewsManagement';
import TeamManagement from './Dashboard/TeamManagement';

function AdminDashboardView({ user, handleLogout, fetchUsers, users, handleUpdateUserRole, handleDeleteUser, handleEditUser, editingUser, editedUserName, setEditedUserName, editedUserEmail, setEditedUserEmail, editedUserRole, setEditedUserRole, handleUpdateUser, handleCreateUser, newUserName, setNewUserName, newUserEmail, setNewUserEmail, newUserPassword, setNewUserPassword, newUserRole, setNewUserRole, activeUserSubTab, setActiveUserSubTab, setEditingUser, setSelectedMatchForOperator, matchStats, token }) {
  const [activeAdminTab, setActiveAdminTab] = useState(user.role === 'match_day_operator' ? 'matches' : 'users');

  useEffect(() => {
    if (user && user.role === 'super_admin' && activeAdminTab === 'users') {
      fetchUsers();
    }
  }, [user, activeAdminTab, fetchUsers]);

  return (
    <div>
      <div style={{ /* This div contains the dashboard header and tab buttons */
        backgroundColor: '#3498db',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '20px'
      }}>
        <h2>{user.role === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}</h2>
        <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        <p>Welcome, {user.name || user.email}!</p>
        <p>Here you can manage {user.role === 'super_admin' ? 'leagues, matches, players, staff, teams, and users.' : 'match stats.'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          {user.role === 'super_admin' ? (['users', 'leagues', 'matches', 'players', 'staff', 'teams', 'news'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              style={{
                backgroundColor: activeAdminTab === tab ? '#2980b9' : '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))) : (
            <button
              onClick={() => setActiveAdminTab('matches')}
              style={{
                backgroundColor: activeAdminTab === 'matches' ? '#2980b9' : '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Matches
            </button>
          )}
        </div>
      </div>
      {/* This div contains the conditional tab content */}
      <div>
        {activeAdminTab === 'users' && user.role === 'super_admin' && (
          <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
            <h3>User Management</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveUserSubTab('existing')}
                style={{
                  backgroundColor: activeUserSubTab === 'existing' ? '#2980b9' : '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Existing Users
              </button>
              <button
                onClick={() => setActiveUserSubTab('create')}
                style={{
                  backgroundColor: activeUserSubTab === 'create' ? '#2980b9' : '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Create User
              </button>
            </div>
            {activeUserSubTab === 'existing' && (
              <React.Fragment>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Email</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Name</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Role</th>
                  <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{user.id}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{user.email}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{user.name}</td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        style={{ 
                          backgroundColor: '#34495e', 
                          color: 'white', 
                          border: '1px solid #4a5568', 
                          padding: '5px', 
                          borderRadius: '4px' 
                        }}
                      >
                        <option value="user">User</option>
                        <option value="match_day_operator">Match-day Operator</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </td>
                    <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ 
                          backgroundColor: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          padding: '5px 10px', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          marginRight: '5px' 
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingUser && (
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
                  <h4>Edit User: {editingUser.name || editingUser.email}</h4>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={editedUserName} 
                    onChange={(e) => setEditedUserName(e.target.value)} 
                    style={{ 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #4a5568', 
                      backgroundColor: '#2c3e50',
                      color: 'white'
                    }} 
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={editedUserEmail} 
                    onChange={(e) => setEditedUserEmail(e.target.value)} 
                    style={{ 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #4a5568', 
                      backgroundColor: '#2c3e50',
                      color: 'white'
                    }} 
                  />
                  <select 
                    value={editedUserRole} 
                    onChange={(e) => setEditedUserRole(e.target.value)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #4a5568', 
                      backgroundColor: '#2c3e50',
                      color: 'white'
                    }}
                  >
                    <option value="user">User</option>
                    <option value="match_day_operator">Match-day Operator</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      onClick={() => setEditingUser(null)}
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
                      onClick={handleUpdateUser}
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
              </React.Fragment>
            )}
            {activeUserSubTab === 'create' && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h4>Create New User</h4>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #4a5568', 
                    backgroundColor: '#34495e',
                    color: 'white'
                  }} 
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #4a5568', 
                    backgroundColor: '#34495e',
                    color: 'white'
                  }} 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)} 
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #4a5568', 
                    backgroundColor: '#34495e',
                    color: 'white'
                  }} 
                />
                <select 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #4a5568', 
                    backgroundColor: '#34495e',
                    color: 'white'
                  }}
                >
                  <option value="user">User</option>
                  <option value="match_day_operator">Match-day Operator</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="editor">Editor</option>
                </select>
                <button 
                  onClick={handleCreateUser}
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
                  Create User
                </button>
              </div>
            )}
          </div>
        )}
        {activeAdminTab === 'leagues' && <LeagueManagement />}
        {activeAdminTab === 'matches' && <MatchManagement user={user} token={token} />}
        {activeAdminTab === 'players' && <PlayerManagement />}
        {activeAdminTab === 'staff' && <StaffManagement />}
        {activeAdminTab === 'teams' && <TeamManagement />}
        {activeAdminTab === 'news' && <NewsManagement />}
      </div>

      {/* Live Match Stats */}
      {matchStats.id && (
        <div style={{
          backgroundColor: '#34495e',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3 style={{ textAlign: 'center' }}>Live Match</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '30px' }}>
            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Goals:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_score}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_score}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Yellow Cards:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_yellow_cards}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_yellow_cards}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Red Cards:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_red_cards}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_red_cards}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Corners:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_corners}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_corners}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Offsides:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_offsides}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_offsides}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_shots}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_shots}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Shots-on-Target:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.home_shots_on_target}</div>
            <div style={{ textAlign: 'center' }}>{matchStats.away_shots_on_target}</div>

            <div style={{ textAlign: 'right', paddingRight: '10px' }}>Possession:</div>
            <div style={{ textAlign: 'center' }}>{matchStats.possession} %</div>
            <div style={{ textAlign: 'center' }}>{100 - matchStats.possession} %</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardView;
