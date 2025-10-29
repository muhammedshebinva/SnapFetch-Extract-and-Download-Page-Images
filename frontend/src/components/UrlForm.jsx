import React, { useState } from 'react';

// VIEW: Renders the form
// CONTROLLER: Passes the "onSubmit" event up to the parent
function UrlForm({ onScrape, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onScrape(url);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL (e.g., https://www.google.com)"
        style={{ width: '300px', padding: '8px' }}
        disabled={isLoading}
      />
      <button type="submit" style={{ padding: '8px' }} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Images'}
      </button>
    </form>
  );
}

export default UrlForm;