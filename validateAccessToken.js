require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  };

  const data = {
    grant_type: 'client_credentials'
  };

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(data), { headers });
    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
}

getAccessToken();
