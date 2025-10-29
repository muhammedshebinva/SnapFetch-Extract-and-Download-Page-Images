import React from 'react';
import ImageCard from './ImageCard';

// VIEW: Renders the grid of images
// UPDATED: Now accepts 'format' prop
function ImageGrid({ images, format }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {images.map((img, index) => (
        // UPDATED: Pass format to ImageCard
        <ImageCard key={index} imageUrl={img} format={format} />
      ))}
    </div>
  );
}

export default ImageGrid;