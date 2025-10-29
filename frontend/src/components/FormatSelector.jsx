import React from 'react';

function FormatSelector({ format, onFormatChange, disabled }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <label htmlFor="format-select" style={{ marginRight: '10px' }}>
        <strong>Select Download Format:</strong>
      </label>
      <select 
        id="format-select"
        value={format}
        onChange={(e) => onFormatChange(e.target.value)}
        disabled={disabled}
        style={{ padding: '8px' }}
      >
        <option value="jpg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
        <option value="gif">GIF</option> {/* <-- ADD THIS OPTION */}
      </select>
    </div>
  );
}

export default FormatSelector;