const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const url = require('url'); // Built-in Node.js module
const archiver = require('archiver'); // NEW: For zipping files

const app = express();
const PORT = 4000;

app.use(cors()); // Allow requests from our React app
app.use(express.json()); // To parse POST request bodies

// CONTROLLER: /scrape endpoint
app.get('/scrape', async (req, res) => {
  const { targetUrl } = req.query;

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl query parameter is required' });
  }

  try {
    // MODEL: Fetching the data
    const response = await axios.get(targetUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const images = [];

    const baseUrl = new URL(targetUrl);

    // MODEL: Parsing the data
    $('img').each((index, element) => {
      let src = $(element).attr('src');

      if (src) {
        // Resolve relative URLs to absolute URLs
        try {
          const absoluteUrl = new URL(src, baseUrl.origin).href;
          if (!images.includes(absoluteUrl)) {
             images.push(absoluteUrl);
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    res.json({ images });
  } catch (error) {
    console.error('Error scraping:', error.message);
    res.status(500).json({ error: `Failed to scrape URL: ${error.message}` });
  }
});

// CONTROLLER: /download endpoint
app.get('/download', async (req, res) => {
  const { imageUrl } = req.query;

  try {
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    // Try to get a filename
    const parsedUrl = new URL(imageUrl);
    const filename = parsedUrl.pathname.split('/').pop() || 'image.jpg';

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type']);

    // MODEL: Stream the image data to the client
    response.data.pipe(res);

  } catch (error) {
    console.error('Error downloading image:', error.message);
    res.status(500).json({ error: 'Failed to download image' });
  }
});

//CONTROLLER: /download-all endpoint ###
app.post('/download-all', async (req, res) => {
  const { imageUrls } = req.body;

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({ error: 'imageUrls array is required' });
  }

  try {
    // Set headers for the zip file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');

    const zip = archiver('zip');
    zip.pipe(res); // Pipe the zip archive directly to the response

    // MODEL: Fetch each image and append it to the zip
    const imagePromises = imageUrls.map(async (imageUrl, index) => {
      try {
        const response = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream'
        });

        // Get a filename, add index to prevent duplicates
        const parsedUrl = new URL(imageUrl);
        const filename = `image-${index}-${parsedUrl.pathname.split('/').pop() || 'image.jpg'}`;
        
        // Add the image stream to the zip
        zip.append(response.data, { name: filename });
      } catch (err) {
        console.error(`Failed to fetch image ${imageUrl}: ${err.message}`);
        // If one image fails, we log it but don't stop the zip
      }
    });

    // Wait for all image fetching to be initiated
    await Promise.all(imagePromises);

    // Finalize the zip (no more files will be added)
    zip.finalize();

  } catch (error) {
    console.error('Error creating zip:', error.message);
    res.status(500).json({ error: 'Failed to create zip file' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});