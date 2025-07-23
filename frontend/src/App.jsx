import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MatchdayOperatorView from './components/MatchdayOperatorView';
import AdminDashboardView from './components/AdminDashboardView';
import PublicView from './components/PublicView';
import './App.css';

import io from 'socket.io-client';

const socket = io('http://localhost:5001'); // Connect to your backend WebSocket server

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginFields, setShowLoginFields] = useState(false);
  
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [activeUserSubTab, setActiveUserSubTab] = useState('existing'); // Default to existing users sub-tab
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [editingUser, setEditingUser] = useState(null);
  const [editedUserName, setEditedUserName] = useState('');
  const [editedUserEmail, setEditedUserEmail] = useState('');
  const [editedUserRole, setEditedUserRole] = useState('');
  const [matchStats, setMatchStats] = useState({});

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        if (!user || data.user.id !== user.id) {
          setUser(data.user);
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data.msg);
        alert(`Login failed: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error during login. Please check console for details.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchUsers = useCallback(async () => {
    console.log('fetchUsers - user:', user);
    console.log('fetchUsers - user role:', user?.role);
    if (!user || user.role !== 'super_admin') {
      console.log('fetchUsers - User is not super_admin or not logged in. Aborting fetch.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('fetchUsers - token:', token);
      const response = await fetch('http://localhost:5001/api/v1/users', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [user, activeAdminTab]);

  

  

  

  

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!user || user.role !== 'super_admin') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('User role updated successfully!');
        fetchUsers();
      } else {
        console.error('Failed to update user role:', data.msg);
        alert(`Failed to update user role: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please check console for details.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!user || user.role !== 'super_admin') return;

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert(`Failed to delete user: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please check console for details.');
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditedUserName(userToEdit.name);
    setEditedUserEmail(userToEdit.email);
    setEditedUserRole(userToEdit.role);
  };

  const handleUpdateUser = async () => {
    if (!user || user.role !== 'super_admin') return;
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: editedUserName, email: editedUserEmail, role: editedUserRole }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        console.error('Failed to update user:', data.msg);
        alert(`Failed to update user: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please check console for details.');
    }
  };

  const handleCreateUser = async () => {
    if (!user || user.role !== 'super_admin') return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('User created successfully!');
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        fetchUsers();
        setActiveUserSubTab('existing');
      } else {
        console.error('Failed to create user:', data.msg);
        alert(`Failed to create user: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please check console for details.');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Optional: Verify token with backend to ensure it's still valid
          const response = await fetch('http://localhost:5001/api/v1/users/verifyToken', {
            headers: {
              'x-auth-token': token,
            },
          });

          if (response.ok) {
            setUser(parsedUser);
            setIsLoggedIn(true);
          } else {
            // Token is invalid or expired
            console.error('Token verification failed:', response.statusText);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);
            navigate('/login'); // Redirect to login
          }
        } catch (error) {
          console.error('Failed to parse user from localStorage or verify token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setUser(null);
          navigate('/login'); // Redirect to login
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        // Only navigate to login if not already on login or public view
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          navigate('/login');
        }
      }
    };

    checkAuth();

    console.log('App.jsx - Current user:', user);
    console.log('App.jsx - User role:', user?.role);
    if (user && user.role === 'super_admin' && activeAdminTab === 'users') {
      fetchUsers();
    }

    socket.on('match_stats_updated', (data) => {
      setMatchStats(data);
    });

    return () => {
      socket.off('match_stats_updated');
    };
  }, [user, activeAdminTab, navigate]);

  const renderContent = () => {
    if (user && (user.role === 'super_admin' || user.role === 'match_day_operator')) {
      return (
        <AdminDashboardView
          user={user}
          handleLogout={handleLogout}
          fetchUsers={fetchUsers}
          users={users}
          handleUpdateUserRole={handleUpdateUserRole}
          handleDeleteUser={handleDeleteUser}
          handleEditUser={handleEditUser}
          editingUser={editingUser}
          editedUserName={editedUserName}
          setEditedUserName={setEditedUserName}
          editedUserEmail={editedUserEmail}
          setEditedUserEmail={setEditedUserEmail}
          editedUserRole={editedUserRole}
          setEditedUserRole={setEditedUserRole}
          handleUpdateUser={handleUpdateUser}
          handleCreateUser={handleCreateUser}
          newUserName={newUserName}
          newUserEmail={newUserEmail}
          newUserPassword={newUserPassword}
          newUserRole={newUserRole}
          setNewUserName={setNewUserName}
          setNewUserEmail={setNewUserEmail}
          setNewUserPassword={setNewUserPassword}
          setNewUserRole={setNewUserRole}
          activeUserSubTab={activeUserSubTab}
          setActiveUserSubTab={setActiveUserSubTab}
          setEditingUser={setEditingUser}
          matchStats={matchStats}
          token={localStorage.getItem('token')}
        />
      );
    } else {
      return <PublicView matchStats={matchStats} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <nav className="main-nav">
        <div className="nav-brand">
          <div className="nav-brand-dot"></div>
          <span className="nav-brand-name">FAZ Scores</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link nav-link-active">SCORES</a>
          <a href="#" className="nav-link">NEWS</a>
        </div>
        <div className="nav-actions">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          {user ? (
            <div className="profile-container">
              <span className="welcome-text">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <React.Fragment>
              {showLoginFields && (
                <React.Fragment>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="login-input"
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="login-input"
                  />
                </React.Fragment>
              )}
              <button 
                onClick={() => {
                  if (showLoginFields) {
                    handleLogin();
                  } else {
                    setShowLoginFields(true);
                  }
                }}
                className="login-button"
              >
                LOGIN
              </button>
            </React.Fragment>
          )}
          <div className="menu-icon">
            <div className="menu-icon-bar"></div>
            <div className="menu-icon-bar"></div>
            <div className="menu-icon-bar"></div>
          </div>
        </div>
      </nav>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-link-active">FOOTBALL</div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <h3 className="sidebar-heading">PINNED LEAGUES</h3>
          <div className="sidebar-content">
            No pinned leagues
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>

        {/* Right Sidebar (Ad Area) */}
        <div className="right-sidebar">
          {/* FIFA Club World Cup Card */}
          <div className="promo-card">
            <h3>
              FIFA CLUB WORLD CUP
            </h3>
            <p>
              EVERY GAME FREE ON DAZN
            </p>
          </div>

          {/* Advertisement Placeholder */}
          <div className="ad-placeholder">
            Advertisement Placeholder
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        © 2025 FAZ Football Scores
      </footer>
    </div>
  );
}

export default App;
