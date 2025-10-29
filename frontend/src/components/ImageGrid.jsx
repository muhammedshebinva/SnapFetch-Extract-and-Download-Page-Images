import React from 'react';
import ImageCard from './ImageCard';

// UPDATED: No longer accepts 'format' prop
function ImageGrid({ images }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {images.map((img, index) => (
        // UPDATED: No longer passes format to ImageCard
        <ImageCard key={index} imageUrl={img} />
      ))}
    </div>
  );
}

export default ImageGrid;