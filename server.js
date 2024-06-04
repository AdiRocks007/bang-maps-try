const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/places', async (req, res) => {
  const { type, lat, lng } = req.query;
  const apiKey = 'AIzaSyAMbl_cn5P__bUfx_8aJvLG_GxZQCBK7lw'; // Replace with your actual Google Maps API key

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius: 5000,
        type,
        key: apiKey
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    res.status(500).send(`Error fetching ${type} data`);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
