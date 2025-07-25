import React, { useState } from 'react';
import NewsManagement from './Dashboard/NewsManagement';

function EditorDashboardView({ user, handleLogout, token }) {
  const [activeEditorTab, setActiveEditorTab] = useState('news');

  return (
    <div className="editor-dashboard-container">
      <div className="dashboard-header">
        <h2>Editor Dashboard</h2>
        <p>Welcome, {user.name || user.email}!</p>
        <div className="tab-buttons">
          <button
            onClick={() => setActiveEditorTab('news')}
            className={`tab-button ${activeEditorTab === 'news' ? 'active' : ''}`}
          >
            News Management
          </button>
          <button
            onClick={() => setActiveEditorTab('ads')}
            className={`tab-button ${activeEditorTab === 'ads' ? 'active' : ''}`}
          >
            Ad Management
          </button>
        </div>
        
      </div>

      <div>
        {activeEditorTab === 'news' && <NewsManagement token={token} />}
        {activeEditorTab === 'ads' && <div>Ad Management Content Coming Soon!</div>}
      </div>
    </div>
  );
}

export default EditorDashboardView;