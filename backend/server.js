const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const url = require('url');
const archiver = require('archiver');
const sharp = require('sharp'); // For image processing

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());


// === HELPER FUNCTION: Resolve URL ===
// Turns a relative path like "/logo.png" into a full URL
const resolveUrl = (baseUrl, relativePath) => {
  if (!relativePath || relativePath.startsWith('data:')) {
    return relativePath; // Return data URIs or empty strings as-is
  }
  try {
    return new URL(relativePath, baseUrl.origin).href;
  } catch (e) {
    console.error(`Invalid URL: ${relativePath} against ${baseUrl.origin}`);
    return null;
  }
};


// === CONTROLLER: /scrape (HEAVILY UPDATED) ===
app.get('/scrape', async (req, res) => {
  const { targetUrl } = req.query;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl query parameter is required' });
  }

  try {
    const response = await axios.get(targetUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const baseUrl = new URL(targetUrl);

    // Use a Set to avoid duplicate image URLs
    const imageUrls = new Set();

    // 1. Find <img> tags (src and data-src for lazy loading)
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      const resolved = resolveUrl(baseUrl, src);
      if (resolved) imageUrls.add(resolved);
    });

    // 2. Find <picture> <source> tags
    $('picture source').each((i, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        // Get the first URL from srcset (e.g., "image.jpg 1x, image-2x.jpg 2x")
        const firstUrl = srcset.split(',')[0].trim().split(' ')[0];
        const resolved = resolveUrl(baseUrl, firstUrl);
        if (resolved) imageUrls.add(resolved);
      }
    });

    // 3. Find favicons and apple icons
    $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').each((i, el) => {
      const href = $(el).attr('href');
      const resolved = resolveUrl(baseUrl, href);
      if (resolved) imageUrls.add(resolved);
    });

    // 4. Find inline <svg> tags and convert to data URI
    $('svg').each((i, el) => {
      const svgHtml = $.html(el);
      const base64 = Buffer.from(svgHtml).toString('base64');
      const dataUri = `data:image/svg+xml;base64,${base64}`;
      imageUrls.add(dataUri);
    });

    // 5. Find inline style attributes with 'background-image'
    $('*[style]').each((i, el) => {
      const style = $(el).attr('style');
      // Basic regex to find url(...)
      const match = style.match(/background-image:\s*url\(['"]?(.+?)['"]?\)/);
      if (match && match[1]) {
        const resolved = resolveUrl(baseUrl, match[1]);
        if (resolved) imageUrls.add(resolved);
      }
    });

    // Convert Set back to an array
    res.json({ images: Array.from(imageUrls) });

  } catch (error) {
    console.error('Error scraping:', error.message);
    res.status(500).json({ error: `Failed to scrape URL: ${error.message}` });
  }
});


// === HELPER FUNCTION: Get Image Buffer ===
// This can handle both real URLs and data URIs
const getImageBuffer = async (imageUrl) => {
  if (imageUrl.startsWith('data:')) {
    // It's a data URI (e.g., from an inline SVG)
    const parts = imageUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!parts) throw new Error('Invalid data URI');
    return Buffer.from(parts[2], 'base64');
  } else {
    // It's a real URL, fetch it
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    return response.data;
  }
};


// === CONTROLLER: /download (UPDATED) ===
app.get('/download', async (req, res) => {
  const { imageUrl, format = 'jpg' } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    // NEW: Use helper to get buffer from URL or Data URI
    const inputBuffer = await getImageBuffer(imageUrl);

    const newFilename = `image-${Date.now()}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${newFilename}"`);
    res.setHeader('Content-Type', `image/${format}`);

    // Process with sharp. 
    // { animated: true } allows it to read all frames of a GIF
    sharp(inputBuffer, { animated: true })
      .toFormat(format)
      .pipe(res);

  } catch (error) {
    console.error('Error downloading image:', error.message);
    res.status(500).json({ error: 'Failed to download or convert image' });
  }
});


// === CONTROLLER: /download-all (UPDATED) ===
app.post('/download-all', async (req, res) => {
  const { imageUrls, format = 'jpg' } = req.body;

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: 'imageUrls array is required' });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');

    const zip = archiver('zip');
    zip.pipe(res);

    let counter = 0;
    for (const imageUrl of imageUrls) {
      try {
        // NEW: Use helper to get buffer
        const inputBuffer = await getImageBuffer(imageUrl);

        const newFilename = `image-${counter}.${format}`;
        counter++;

        // Convert image and append to zip
        const convertedBuffer = await sharp(inputBuffer, { animated: true })
          .toFormat(format)
          .toBuffer();

        zip.append(convertedBuffer, { name: newFilename });

      } catch (err) {
        console.error(`Failed to process image ${imageUrl}: ${err.message}`);
      }
    }

    zip.finalize();
  } catch (error) {
    console.error('Error creating zip:', error.message);
    res.status(500).json({ error: 'Failed to create zip file' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});