import React, { useState } from 'react';
import ContentForm from './ContentForm';
import MediaUpload from './MediaUpload';
import AdManagement from './AdManagement';

const EditorDashboard = ({ adPlaceholders }) => {
  const [activeTab, setActiveTab] = useState('news');

  const handleClearAllAds = async () => {
    if (!window.confirm('Are you sure you want to delete ALL ads? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/editor/ads/clear-all', {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      if (response.ok) {
        alert('All ads cleared successfully!');
        // Optionally, refresh ads in App.jsx if needed
      } else {
        const data = await response.json();
        alert(`Failed to clear ads: ${data.msg || response.statusText}`);
      }
    } catch (error) {
      console.error('Error clearing ads:', error);
      alert('Error clearing ads. Please check console for details.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'news':
        return <ContentForm />;
      case 'media':
        return <MediaUpload />;
      case 'ads':
        return <AdManagement adPlaceholders={adPlaceholders} />;
      default:
        return <ContentForm />;
    }
  };

  return (
    <div className="editor-dashboard">
      <h1>Editor Dashboard</h1>
      <nav>
        <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>News</button>
        <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>Media</button>
        <button className={activeTab === 'ads' ? 'active' : ''} onClick={() => setActiveTab('ads')}>Ads</button>
        <button onClick={handleClearAllAds} className="clear-ads-button">Clear All Ads</button>
      </nav>
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default EditorDashboard;
