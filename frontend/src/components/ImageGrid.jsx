import React from 'react';
import ImageCard from './ImageCard';

// VIEW: Renders the grid of images
function ImageGrid({ images }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {images.map((img, index) => (
        <ImageCard key={index} imageUrl={img} />
      ))}
    </div>
  );
}

export default ImageGrid;