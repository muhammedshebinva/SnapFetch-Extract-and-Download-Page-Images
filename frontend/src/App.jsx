import React, { useState } from 'react';
import UrlForm from './components/UrlForm';
import ImageGrid from './components/ImageGrid';
//import './App.css'; // You can keep the default styling

// This component acts as the main VIEW and CONTROLLER
function App() {
  // MODEL: Application state
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // CONTROLLER: Logic to handle the scrape request
  const handleScrape = async (targetUrl) => {
    setIsLoading(true);
    setError(null);
    setImages([]); // Clear previous images

    try {
      // Talk to our backend, not the target site
      const response = await fetch(`http://localhost:4000/scrape?targetUrl=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Something went wrong');
      }

      const data = await response.json();
      
      // MODEL: Update state
      setImages(data.images);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // VIEW: Render the main application
  return (
    <div className="App" style={{ padding: '20px' }}>
      <header>
        <h1>Image Scraper</h1>
        <p>Paste a URL to pull all images from the page.</p>
      </header>
      <UrlForm onScrape={handleScrape} isLoading={isLoading} />
      
      {error && (
        <div style={{ color: 'red', margin: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <ImageGrid images={images} />
    </div>
  );
}

export default App;