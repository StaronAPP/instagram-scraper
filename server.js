const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid or missing Instagram URL' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);
    const jsonText = $('script[type="application/ld+json"]').html();

    if (!jsonText) {
      return res.status(500).json({ error: 'Could not find metadata in page' });
    }

    const jsonData = JSON.parse(jsonText);
    const imageUrl = jsonData.image;

    res.json({ image: imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse Instagram page' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});