const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' });
  }

  const url = `https://www.instagram.com/${username}/`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);
    const scripts = $('script[type="text/javascript"]').toArray();

    let sharedDataScript = scripts.find(script =>
      $(script).html().trim().startsWith('window._sharedData')
    );

    if (!sharedDataScript) {
      return res.status(500).json({ error: 'Could not find sharedData script in page' });
    }

    const scriptContent = $(sharedDataScript).html();
    const jsonText = scriptContent.match(/window\._sharedData\s*=\s*(\{.*\});/)[1];
    const jsonData = JSON.parse(jsonText);

    const profilePicUrl = jsonData.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;

    res.json({ image: profilePicUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse Instagram profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});