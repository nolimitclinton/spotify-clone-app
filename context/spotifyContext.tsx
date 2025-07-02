import * as AuthSession from 'expo-auth-session';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CLIENT_ID, SCOPES } from '../constants/Config';
import { deleteToken, getToken, saveToken } from '../utils/storage';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  followers: { total: number };
};

type Track = {
  id: string;
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
  duration_ms: number;
  uri: string;
};

type Playlist = {
  id: string;
  name: string;
  images: { url: string }[];
  owner: { display_name: string };
  tracks: { total: number };
};

type Album = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  release_date: string;
  total_tracks: number;
};

type SpotifyContextType = {
  user: any;
  accessToken: string | null;
  searchResults: any[];
  currentTrack: Track | null;
  featuredPlaylists: Playlist[];
  newReleases: Album[];
  userPlaylists: Playlist[];
  topArtists: Artist[];
  topTracks: Track[]; 
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  searchTracks: (query: string) => void;
  getArtist: (artistId: string) => Promise<Artist | null>;
  getArtistTopTracks: (artistId: string) => Promise<Track[]>;
  getArtistAlbums: (artistId: string) => Promise<Album[]>;
  //getRelatedArtists: (artistId: string) => Promise<Artist[]>;
  //getFeaturedPlaylists: () => Promise<void>;
  getNewReleases: () => Promise<void>;
  getUserPlaylists: () => Promise<void>;
  getTopArtists: () => Promise<void>;
  getTopTracks: () => Promise<void>; 
  setCurrentTrack: (track: Track | null) => void;
};

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true,} as any);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );
  console.log(redirectUri);
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        const res = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!res.ok) throw new Error('Invalid or expired token');

        const userData = await res.json();
        setAccessToken(savedToken);
        setUser(userData);
      } catch (error) {
        console.warn('Failed to restore session:', error);
        await deleteToken();
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreToken();
  }, []);

  useEffect(() => {
    const fetchTokenAndUser = async () => {
      if (
        response?.type === 'success' &&
        request?.codeVerifier &&
        response.params?.code
      ) {
        try {
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId: CLIENT_ID,
              code: response.params.code,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier },
            },
            discovery
          );
          const token = tokenResult.accessToken;
          await saveToken(token);
          setAccessToken(token);

          const res = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error('Failed to fetch user data');

          const userData = await res.json();
          setUser(userData);
        } catch (err) {
          console.error('Authentication failed:', err);
          await deleteToken();
          setAccessToken(null);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTokenAndUser();
  }, [response]);

  const searchTracks = async (query: string) => {
    if (!query || !accessToken) return;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();

      const tracks = json.tracks?.items.map((t: any) => ({
        id: t.id,
        name: t.name,
        uri: t.uri,
        album: t.album,
        artists: t.artists,
        type: 'track',
      })) || [];

      const artists = json.artists?.items.map((a: any) => ({
        ...a,
        type: 'artist',
      })) || [];

      setSearchResults([...tracks, ...artists]);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };
  const getTopArtists = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=6', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTopArtists(data.items || []);
    } catch (error) {
      console.error('Failed to fetch top artists:', error);
    }
  };
  // const getFeaturedPlaylists = async () => {
  //   if (!accessToken) return;
  //   try {
  //     const res = await fetch('https://api.spotify.com/v1/browse/featured-playlists?country=US&limit=10', {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     });
  //     const data = await res.json();
  //     setFeaturedPlaylists(data.playlists?.items || []);
  //   } catch (error) {
  //     console.error('Failed to fetch featured playlists:', error);
  //   }
  // };

  const getNewReleases = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/browse/new-releases?country=US&limit=6', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setNewReleases(data.albums?.items || []);
    } catch (error) {
      console.error('Failed to fetch new releases:', error);
    }
  };
  const getTopTracks = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=6', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTopTracks(data.items || []);
    } catch (error) {
      console.error('Failed to fetch top tracks:', error);
    }
  };

  const getUserPlaylists = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUserPlaylists(data.items || []);
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
    }
  };
  const getArtist = async (artistId: string) => {
    if (!accessToken) return null;
    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch artist:', error);
      return null;
    }
  };

// const getRelatedArtists = async (artistId: string) => {
//   if (!accessToken) return [];
//   try {
//     const res = await fetch(
//       `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
//       { headers: { Authorization: `Bearer ${accessToken}` } }
//     );
//     const data = await res.json();
//     console.log('Related artist data:', data);
//     return data.artists || [];
//   } catch (error) {
//     console.error('Failed to fetch related artists:', error);
//     return [];
//   }
// };

  const getArtistTopTracks = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=NG`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Failed to fetch top tracks:', error);
      return [];
    }
  };

  const getArtistAlbums = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=6`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      return [];
    }
  };

  const logout = async () => {
    await deleteToken();
    setUser(null);
    setAccessToken(null);
    setSearchResults([]);
  };

  const value = {
    user,
    accessToken,
    searchResults,
    currentTrack,
    featuredPlaylists,
    newReleases,
    userPlaylists,
    topArtists,
    isLoading,
    login: () => promptAsync({ useProxy: true } as any),
    logout,
    searchTracks,
    getArtist,
    getArtistTopTracks,
    getArtistAlbums,
    //getRelatedArtists,
    //getFeaturedPlaylists,
    getNewReleases,
    getUserPlaylists,
    getTopArtists,
    setCurrentTrack,
    topTracks,
    getTopTracks,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error('useSpotify must be used within SpotifyProvider');
  return context;
};