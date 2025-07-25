import React, { useState } from 'react';

const ContentForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('author', JSON.parse(localStorage.getItem('user')).name || 'Unknown'); // Assuming user is in localStorage
    if (imageFile) {
      formData.append('image_file', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/editor/news/', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('News created successfully!');
        setTitle('');
        setContent('');
        setCategory('');
        setImageFile(null);
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to create news.');
    }
  };

  return (
    <div className="content-form">
      <h2>Create News Article</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Content:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
        </div>
        <div>
          <label>Category:</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div>
          <label>Image (Optional):</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>
        <button type="submit">Save News</button>
      </form>
    </div>
  );
};

export default ContentForm;
