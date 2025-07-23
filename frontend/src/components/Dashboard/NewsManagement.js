import React, { useState, useEffect } from 'react';

function NewsManagement() {
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]); // To store users for author/approver names
  const [activeNewsSubTab, setActiveNewsSubTab] = useState('existing'); // Default to existing news

  // State for new news form
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');

  // State for editing news
  const [editingNews, setEditingNews] = useState(null);
  const [editedNewsTitle, setEditedNewsTitle] = useState('');
  const [editedNewsContent, setEditedNewsContent] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/news', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setNews(data);
      } else {
        console.error('Failed to fetch news:', data.msg);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
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
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name || user.email : 'N/A';
  };

  const handleCreateNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored in localStorage

      const response = await fetch('http://localhost:5001/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          title: newNewsTitle,
          content: newNewsContent,
          author_id: user.id, // Assign current user as author
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('News article created successfully!');
        setNewNewsTitle('');
        setNewNewsContent('');
        setActiveNewsSubTab('existing'); // Switch back to existing news tab
        fetchNews(); // Refresh the list
      } else {
        alert(`Failed to create news article: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating news article:', error);
      alert('Error creating news article. Please check console for details.');
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('News article deleted successfully!');
        fetchNews(); // Refresh the list
      } else {
        alert(`Failed to delete news article: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error deleting news article:', error);
      alert('Error deleting news article. Please check console for details.');
    }
  };

  const handleEditNews = (article) => {
    setEditingNews(article);
    setEditedNewsTitle(article.title);
    setEditedNewsContent(article.content);
    setRejectionReason(article.rejection_reason || '');
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await fetch(`http://localhost:5001/api/v1/news/${editingNews.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          title: editedNewsTitle,
          content: editedNewsContent,
          author_id: user.id, // Keep current user as author
          published_date: editingNews.published_date, // Keep original published date
          status: editingNews.status, // Keep original status
          approved_by: editingNews.approved_by, // Keep original approved_by
          rejection_reason: editingNews.rejection_reason, // Keep original rejection_reason
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('News article updated successfully!');
        setEditingNews(null);
        fetchNews(); // Refresh the list
      } else {
        alert(`Failed to update news article: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error updating news article:', error);
      alert('Error updating news article. Please check console for details.');
    }
  };

  const handleApproveNews = async (newsId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/news/${newsId}/approve`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert('News article approved successfully!');
        fetchNews();
      } else {
        alert(`Failed to approve news article: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error approving news article:', error);
      alert('Error approving news article. Please check console for details.');
    }
  };

  const handleRequestEdit = async (newsId) => {
    if (!rejectionReason) {
      alert('Please provide a reason for requesting edits.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/v1/news/${newsId}/request-edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Edit requested successfully!');
        setEditingNews(null); // Close edit form
        setRejectionReason('');
        fetchNews();
      } else {
        alert(`Failed to request edit: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error requesting edit:', error);
      alert('Error requesting edit. Please check console for details.');
    }
  };

  useEffect(() => {
    fetchNews();
    fetchUsers(); // Fetch users to map author_id and approved_by
  }, []);

  const user = JSON.parse(localStorage.getItem('user'));
  const isSuperAdmin = user && user.role === 'super_admin';
  const isEditor = user && user.role === 'editor';

  return (
    <div style={{ backgroundColor: '#34495e', padding: '20px', borderRadius: '8px', color: 'white' }}>
      <h3>News Management</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveNewsSubTab('existing')}
          style={{
            backgroundColor: activeNewsSubTab === 'existing' ? '#2980b9' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Existing News
        </button>
        {(isEditor || isSuperAdmin) && (
          <button
            onClick={() => setActiveNewsSubTab('create')}
            style={{
              backgroundColor: activeNewsSubTab === 'create' ? '#2980b9' : '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Create News
          </button>
        )}
      </div>

      {activeNewsSubTab === 'existing' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Title</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Author</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Published Date</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Approved By</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Rejection Reason</th>
              <th style={{ border: '1px solid #4a5568', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map(article => (
              <tr key={article.id}>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{article.id}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{article.title}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getUserName(article.author_id)}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{new Date(article.published_date).toLocaleDateString()}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{article.status}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{getUserName(article.approved_by)}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>{article.rejection_reason || 'N/A'}</td>
                <td style={{ border: '1px solid #4a5568', padding: '8px' }}>
                  {(isEditor && article.status === 'pending_approval') && (
                    <button 
                      onClick={() => handleEditNews(article)}
                      style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                      Edit
                    </button>
                  )}
                  {(isSuperAdmin && article.status === 'pending_approval') && (
                    <button 
                      onClick={() => handleApproveNews(article.id)}
                      style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                      Approve
                    </button>
                  )}
                  {(isSuperAdmin && article.status === 'pending_approval') && (
                    <button 
                      onClick={() => handleEditNews(article)} // Re-use edit to show rejection reason input
                      style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                      Request Edit
                    </button>
                  )}
                  {(isSuperAdmin || (isEditor && article.status === 'draft')) && (
                    <button 
                      onClick={() => handleDeleteNews(article.id)}
                      style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeNewsSubTab === 'create' && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px' }}>
          <h4>Create New News Article</h4>
          <input 
            type="text" 
            placeholder="Title" 
            value={newNewsTitle} 
            onChange={(e) => setNewNewsTitle(e.target.value)} 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          />
          <textarea 
            placeholder="Content" 
            value={newNewsContent} 
            onChange={(e) => setNewNewsContent(e.target.value)} 
            rows="10" 
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #4a5568', 
              backgroundColor: '#34495e',
              color: 'white'
            }} 
          ></textarea>
          <button 
            onClick={handleCreateNews}
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
            Submit for Approval
          </button>
        </div>
      )}

      {editingNews && (
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
            width: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h4>Edit News Article: {editingNews.title}</h4>
            <input 
              type="text" 
              placeholder="Title" 
              value={editedNewsTitle} 
              onChange={(e) => setEditedNewsTitle(e.target.value)} 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#2c3e50',
                color: 'white'
              }} 
            />
            <textarea 
              placeholder="Content" 
              value={editedNewsContent} 
              onChange={(e) => setEditedNewsContent(e.target.value)} 
              rows="15" 
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #4a5568', 
                backgroundColor: '#34495e',
                color: 'white'
              }} 
            ></textarea>
            {editingNews.status === 'rejected' && (
              <div style={{ backgroundColor: '#e74c3c', padding: '10px', borderRadius: '4px', color: 'white' }}>
                <strong>Rejection Reason:</strong> {editingNews.rejection_reason}
              </div>
            )}
            {isSuperAdmin && editingNews.status === 'pending_approval' && (
              <textarea 
                placeholder="Reason for requesting edit (optional)" 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)} 
                rows="3" 
                style={{ 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #4a5568', 
                  backgroundColor: '#34495e',
                  color: 'white'
                }} 
              ></textarea>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setEditingNews(null)}
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
              {(isEditor && editingNews.status === 'pending_approval') && (
                <button 
                  onClick={handleUpdateNews}
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
              )}
              {(isSuperAdmin && editingNews.status === 'pending_approval') && (
                <button 
                  onClick={() => handleRequestEdit(editingNews.id)}
                  style={{ 
                    backgroundColor: '#f39c12', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Request Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsManagement;
