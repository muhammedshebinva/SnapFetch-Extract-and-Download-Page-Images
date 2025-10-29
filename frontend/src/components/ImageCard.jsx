import React from 'react';

// VIEW: Renders a single image card
// UPDATED: Now accepts 'format' prop
function ImageCard({ imageUrl, format }) {
  
  // UPDATED: Pass both imageUrl and format to our backend
  const downloadUrl = `http://localhost:4000/download?imageUrl=${encodeURIComponent(imageUrl)}&format=${format}`;

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      margin: '10px',
      width: '200px',
      textAlign: 'center'
    }}>
      <img
        src={imageUrl}
        alt="Scraped content"
        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found'; }}
      />
      <a
        href={downloadUrl}
        download // This tells the browser to download, server confirms
        style={{
          display: 'block',
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Download as {format.toUpperCase()}
      </a>
    </div>
  );
}

export default ImageCard;