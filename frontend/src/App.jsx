// import React, { useState } from 'react';
// import UrlForm from './components/UrlForm';
// import ImageGrid from './components/ImageGrid';
// //import './App.css'; // You can keep the default styling

// // This component acts as the main VIEW and CONTROLLER
// function App() {
//   // MODEL: Application state
//   const [images, setImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // CONTROLLER: Logic to handle the scrape request
//   const handleScrape = async (targetUrl) => {
//     setIsLoading(true);
//     setError(null);
//     setImages([]); // Clear previous images

//     try {
//       // Talk to our backend, not the target site
//       const response = await fetch(`http://localhost:4000/scrape?targetUrl=${encodeURIComponent(targetUrl)}`);
      
//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.error || 'Something went wrong');
//       }

//       const data = await response.json();
      
//       // MODEL: Update state
//       setImages(data.images);
      
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // VIEW: Render the main application
//   return (
//     <div className="App" style={{ padding: '20px' }}>
//       <header>
//         <h1>Image Scraper</h1>
//         <p>Paste a URL to pull all images from the page.</p>
//       </header>
//       <UrlForm onScrape={handleScrape} isLoading={isLoading} />
      
//       {error && (
//         <div style={{ color: 'red', margin: '20px' }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       <ImageGrid images={images} />
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import UrlForm from './components/UrlForm';
import ImageGrid from './components/ImageGrid';
import './App.css';

// This component acts as the main VIEW and CONTROLLER
function App() {
  // MODEL: Application state
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // NEW state
  const [error, setError] = useState(null);

  // CONTROLLER: Logic to handle the scrape request
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

  // ### NEW CONTROLLER: Logic to handle "Download All" ###
  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/download-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls: images }),
      });

      if (!response.ok) {
        throw new Error('Failed to create zip file on server');
      }

      // Get the zip file as a blob
      const blob = await response.blob();

      // Create a temporary link to trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip'; // The filename for the user
      document.body.appendChild(a);
      a.click();
      
      // Clean up the temporary link
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
      <UrlForm onScrape={handleScrape} isLoading={isLoading} />
      
      {error && (
        <div style={{ color: 'red', margin: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ### NEW: Download All Button ### */}
      {images.length > 0 && !isLoading && (
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={handleDownloadAll} 
            disabled={isDownloading}
            style={{ padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}
          >
            {isDownloading ? 'Zipping...' : 'Download All as ZIP'}
          </button>
        </div>
      )}

      <ImageGrid images={images} />
    </div>
  );
}

export default App;