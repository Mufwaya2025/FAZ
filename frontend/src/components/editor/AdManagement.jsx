import React, { useState } from 'react';

const AdManagement = ({ adPlaceholders }) => {
  const [adName, setAdName] = useState('');
  const [adImage, setAdImage] = useState(null);
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [googleAdUnitId, setGoogleAdUnitId] = useState('');
  const [googleAdSlotId, setGoogleAdSlotId] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [adStartDate, setAdStartDate] = useState('');
  const [adEndDate, setAdEndDate] = useState('');
  const [adType, setAdType] = useState('image'); // 'image', 'google', 'script'
  const [selectedPlaceholder, setSelectedPlaceholder] = useState('');

  const handleImageAdSubmit = async (e) => {
    e.preventDefault();
    if (!adImage) {
      alert('Please select an image file for the ad.');
      return;
    }
    if (!selectedPlaceholder) {
      alert('Please select an ad placeholder.');
      return;
    }

    const formData = new FormData();
    formData.append('name', adName);
    formData.append('image_file', adImage);
    formData.append('target_url', adTargetUrl);
    formData.append('start_date', adStartDate);
    formData.append('end_date', adEndDate);
    formData.append('placeholder', selectedPlaceholder);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/editor/ads/image', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Image Ad created successfully!');
        // Clear form
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating image ad:', error);
      alert('Failed to create image ad.');
    }
  };

  const handleGoogleAdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlaceholder) {
      alert('Please select an ad placeholder.');
      return;
    }
    const formData = new FormData();
    formData.append('name', adName);
    formData.append('ad_unit_id', googleAdUnitId);
    formData.append('slot_id', googleAdSlotId);
    formData.append('start_date', adStartDate);
    formData.append('end_date', adEndDate);
    formData.append('placeholder', selectedPlaceholder);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/editor/ads/google', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Google Ad configured successfully!');
        // Clear form
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error configuring Google ad:', error);
      alert('Failed to configure Google ad.');
    }
  };

  const handleScriptAdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlaceholder) {
      alert('Please select an ad placeholder.');
      return;
    }
    if (!adName.trim()) {
      alert('Please enter a name for the ad.');
      return;
    }
    console.log('Ad Name before sending:', adName);
    const formData = new FormData();
    formData.append('name', adName);
    const sanitizedScriptContent = scriptContent.replace(/\s*style\s*=\s*("|').*?\1/g, '');
    formData.append('script_content', sanitizedScriptContent);
    formData.append('placement', selectedPlaceholder);
    formData.append('start_date', adStartDate);
    formData.append('end_date', adEndDate);
    formData.append('placeholder', selectedPlaceholder);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/editor/ads/script', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Custom Script Ad created successfully!');
        // Clear form
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error creating script ad:', error);
      alert('Failed to create script ad.');
    }
  };

  return (
    <div className="ad-management">
      <h2>Ad Management</h2>
      <div>
        <label>Ad Type:</label>
        <select value={adType} onChange={(e) => setAdType(e.target.value)}>
          <option value="image">Image Ad</option>
          <option value="google">Google Ad</option>
          <option value="script">Custom Script Ad</option>
        </select>
      </div>

      <form onSubmit={adType === 'image' ? handleImageAdSubmit : adType === 'google' ? handleGoogleAdSubmit : handleScriptAdSubmit}>
        <div>
          <label>Ad Name:</label>
          <input type="text" value={adName} onChange={(e) => setAdName(e.target.value)} required />
        </div>
        <div>
          <label>Ad Placeholder:</label>
          <select value={selectedPlaceholder} onChange={(e) => setSelectedPlaceholder(e.target.value)} required>
            <option value="">Select a Placeholder</option>
            {adPlaceholders.map(placeholder => (
              <option key={placeholder.placement} value={placeholder.placement}>{placeholder.name}</option>
            ))}
          </select>
        </div>
        {adType === 'image' && (
          <>
            <div>
              <label>Image File:</label>
              <input type="file" onChange={(e) => setAdImage(e.target.files[0])} required />
            </div>
            <div>
              <label>Target URL:</label>
              <input type="url" value={adTargetUrl} onChange={(e) => setAdTargetUrl(e.target.value)} required />
            </div>
          </>
        )}
        {adType === 'google' && (
          <>
            <div>
              <label>Ad Unit ID:</label>
              <input type="text" value={googleAdUnitId} onChange={(e) => setGoogleAdUnitId(e.target.value)} required />
            </div>
            <div>
              <label>Slot ID:</label>
              <input type="text" value={googleAdSlotId} onChange={(e) => setGoogleAdSlotId(e.target.value)} required />
            </div>
          </>
        )}
        {adType === 'script' && (
          <>
            <div>
              <label>Script Content:</label>
              <textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} required></textarea>
            </div>
            
          </>
        )}
        <div>
          <label>Start Date (Optional):</label>
          <input type="date" value={adStartDate} onChange={(e) => setAdStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date (Optional):</label>
          <input type="date" value={adEndDate} onChange={(e) => setAdEndDate(e.target.value)} />
        </div>
        <button type="submit">Create Ad</button>
      </form>
    </div>
  );
};

export default AdManagement;
