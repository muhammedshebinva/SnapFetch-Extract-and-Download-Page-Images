import React from 'react';

// VIEW: Renders a single image card
function ImageCard({ imageUrl }) {
  // This URL points to our backend's /download endpoint
  const downloadUrl = `http://localhost:4000/download?imageUrl=${encodeURIComponent(imageUrl)}`;

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
        // Handle images that fail to load
        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found'; }}
      />
      <a
        href={downloadUrl}
        download // The 'download' attribute is handled by our server
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
        Download
      </a>
    </div>
  );
}

export default ImageCard;