const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

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
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const imageUrl = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      const sharedDataScript = scripts.find(script => script.textContent.includes('profile_pic_url_hd'));
      if (!sharedDataScript) return null;
      const jsonText = sharedDataScript.textContent.match(/window\._sharedData\s*=\s*(\{.*\});/);
      if (!jsonText || !jsonText[1]) return null;
      const data = JSON.parse(jsonText[1]);
      return data.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
    });

    await browser.close();

    if (!imageUrl) {
      return res.status(500).json({ error: 'Could not extract image URL' });
    }

    res.json({ image: imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile image', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});