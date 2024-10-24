require('dotenv').config();
const { SpotifyApi } = require('../src/spotifyApiProxy');

describe('Spotify API Tests', () => {
  let spotifyApi;
  let accessToken;

  beforeAll(async () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    accessToken = await SpotifyApi.getAccessToken(clientId, clientSecret);
    spotifyApi = new SpotifyApi(accessToken);
  });

  it('should fetch an album by ID', done => {
    const albumId = '2IYQwwgxgOIn7t3iF6ufFD';
    spotifyApi.getAlbum(albumId, (err, album) => {
      if (err) {
        console.error('Error fetching album:', err);
        done(err); 
      } else {
        expect(album).toBeDefined();
        expect(album.name).toBeDefined(); 
        console.log('Album:', album);
        done();
      }
    });
  }, 10000); 
});
