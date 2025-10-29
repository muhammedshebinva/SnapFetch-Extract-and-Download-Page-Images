import React, { useState } from 'react'; // Import useState

// UPDATED: No longer accepts 'format' prop
function ImageCard({ imageUrl }) {
  
  // NEW: This card now manages its own format state
  const [cardFormat, setCardFormat] = useState('jpg');

  // UPDATED: Uses its own 'cardFormat' state to build the URL
  const downloadUrl = `http://localhost:4000/download?imageUrl=${encodeURIComponent(imageUrl)}&format=${cardFormat}`;

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

      {/* NEW: Individual format selector for this card */}
      <select 
        value={cardFormat}
        onChange={(e) => setCardFormat(e.target.value)}
        style={{ width: '100%', padding: '5px', marginTop: '10px' }}
      >
        <option value="jpg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
        <option value="gif">GIF</option>
      </select>

      <a
        href={downloadUrl}
        download
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
        {/* UPDATED: Uses local state for the button text */}
        Download as {cardFormat.toUpperCase()}
      </a>
    </div>
  );
}

export default ImageCard;