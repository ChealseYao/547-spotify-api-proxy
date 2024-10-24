const axios = require('axios');
const { ApiError, EntityNotFoundError } = require('./error');

class SpotifyApi {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiUrl = 'https://api.spotify.com/v1';
  }

  static async getAccessToken(clientId, clientSecret) {
    const bearer = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${bearer}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      throw new ApiError('Failed to get access token');
    }
  }

  getAlbum(albumId, callback) {
    axios.get(`${this.apiUrl}/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })
    .then((response) => {
      const album = this.formatAlbum(response.data);
      callback(null, album);
    })
    .catch((error) => {
      console.error('API request failed:', error.response || error.message);
      if (error.response && error.response.status === 404) {
        callback(new EntityNotFoundError('Album not found'));
      } else {
        callback(new ApiError('Failed to fetch album')); 
      }
    });  
  }
  

  searchAlbums(query, callback) {
    axios
      .get(`${this.apiUrl}/search`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        params: { q: query, type: 'album' },
      })
      .then((response) => {
        const albums = response.data.albums.items.map((item) => this.formatAlbum(item));
        callback(null, albums);
      })
      .catch((error) => {
        callback(new ApiError('Failed to search albums'));
      });
  }

  getTrack(trackId, callback) {
    axios
      .get(`${this.apiUrl}/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .then((response) => {
        const track = this.formatTrack(response.data);
        callback(null, track);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          callback(new EntityNotFoundError('Track not found'));
        } else {
          callback(new ApiError('Failed to fetch track'));
        }
      });
  }

  searchTracks(query, callback) {
    axios
      .get(`${this.apiUrl}/search`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        params: { q: query, type: 'track' },
      })
      .then((response) => {
        const tracks = response.data.tracks.items.map((item) => this.formatTrack(item));
        callback(null, tracks);
      })
      .catch((error) => {
        callback(new ApiError('Failed to search tracks'));
      });
  }

  getArtist(artistId, callback) {
    axios
      .get(`${this.apiUrl}/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .then((response) => {
        const artist = this.formatArtist(response.data);
        callback(null, artist);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          callback(new EntityNotFoundError('Artist not found'));
        } else {
          callback(new ApiError('Failed to fetch artist'));
        }
      });
  }

  getArtistTopTracks(artistId, marketCode, callback) {
    axios
      .get(`${this.apiUrl}/artists/${artistId}/top-tracks`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        params: { market: marketCode },
      })
      .then((response) => {
        const tracks = response.data.tracks.map((item) => this.formatTrack(item));
        callback(null, tracks);
      })
      .catch((error) => {
        callback(new ApiError('Failed to fetch artist top tracks'));
      });
  }

  getPlaylist(playlistId, callback) {
    axios
      .get(`${this.apiUrl}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      })
      .then((response) => {
        const playlist = this.formatPlaylist(response.data);
        callback(null, playlist);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          callback(new EntityNotFoundError('Playlist not found'));
        } else {
          callback(new ApiError('Failed to fetch playlist'));
        }
      });
  }

  formatAlbum(data) {
    return {
      albumId: data.id,
      artists: data.artists.map(this.formatArtist),
      genres: data.genres || [],
      name: data.name,
      imageUrl: data.images?.[0]?.url || null,
      releaseDate: data.release_date,
      tracks: data.tracks?.items?.map(track => this.formatTrack(track)) || [],
    };
  }
  

  formatTrack(data) {
    return {
      albumId: data.album?.id,
      artists: data.artists.map(artist => this.formatArtist(artist)),
      durationMs: data.duration_ms,
      trackId: data.id,
      name: data.name,
      popularity: data.popularity,
      previewUrl: data.preview_url,
    };
  }
  
  formatArtist(data) {
    return {
      artistId: data.id,
      followers: data.followers?.total,
      genres: data.genres,
      imageUrl: data.images?.[0]?.url || null,
      name: data.name,
      popularity: data.popularity,
    };
  }
  

  formatPlaylist = (data) => {
    return {
      description: data.description,
      followers: data.followers.total,
      playlistId: data.id,
      imageUrl: data.images.length ? data.images[0].url : null,
      name: data.name,
      owner: { userId: data.owner.id },
      public: data.public,
      tracks: data.tracks.items.map((item) => this.formatTrack(item.track)),
    };
  }
}

module.exports = { SpotifyApi };
