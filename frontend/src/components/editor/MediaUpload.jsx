import React, { useState } from 'react';

const MediaUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/editor/media/upload/', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Media uploaded successfully: ${data.filename}`);
        setSelectedFile(null);
        setDescription('');
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media.');
    }
  };

  return (
    <div className="media-upload">
      <h2>Upload Media</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select File:</label>
          <input type="file" onChange={handleFileChange} required />
        </div>
        <div>
          <label>Description:</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default MediaUpload;
