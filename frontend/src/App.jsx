import React, { useState } from 'react';
import UrlForm from './components/UrlForm';
import ImageGrid from './components/ImageGrid';
import FormatSelector from './components/FormatSelector'; // NEW: Import
import './App.css';

function App() {
  // MODEL: Application state
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('jpg'); // NEW: State for format

  // CONTROLLER: Logic for scrape (no change)
  const handleScrape = async (targetUrl) => {
    setIsLoading(true);
    setError(null);
    setImages([]);
    try {
      const response = await fetch(`http://localhost:4000/scrape?targetUrl=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Something went wrong');
      }
      const data = await response.json();
      setImages(data.images);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CONTROLLER: Logic for "Download All" (UPDATED)
  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/download-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // UPDATED: Send the format along with the image URLs
        body: JSON.stringify({ 
          imageUrls: images, 
          format: format 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create zip file on server');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-${format}.zip`; // NEW: Add format to zip name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // VIEW: Render the main application
  return (
    <div className="App" style={{ padding: '20px' }}>
      <header>
        <h1>Image Scraper</h1>
        <p>Paste a URL to pull all images from the page.</p>
      </header>

      {/* Pass loading state to disable form */}
      <UrlForm onScrape={handleScrape} isLoading={isLoading || isDownloading} />

      {/* NEW: Format Selector */}
      {/* Pass loading state to disable selection */}
      <FormatSelector 
        format={format} 
        onFormatChange={setFormat} 
        disabled={isLoading || isDownloading} 
      />
      
      {error && (
        <div style={{ color: 'red', margin: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* "Download All" Button (UPDATED) */}
      {images.length > 0 && !isLoading && (
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={handleDownloadAll} 
            disabled={isDownloading}
            style={{ padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
          >
            {isDownloading ? 'Zipping...' : `Download All as ${format.toUpperCase()}`}
          </button>
        </div>
      )}

      {/* UPDATED: Pass format to the grid */}
      <ImageGrid images={images} format={format} />
    </div>
  );
}

export default App;