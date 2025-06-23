import * as AuthSession from 'expo-auth-session';
import React, { createContext, useContext, useEffect, useState } from 'react';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import { CLIENT_ID, SCOPES } from '../constants/Config';
import { deleteToken, getToken, saveToken } from '../utils/storage';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

type SpotifyContextType = {
  user: any;
  accessToken: string | null;
  searchResults: any[];
  login: () => void;
  searchTracks: (query: string) => void;
  logout: () => void;
  isLoading: boolean;
  getArtist: (artistId: string) => Promise<any>;
  getArtistTopTracks: (artistId: string) => Promise<any[]>;
  getArtistAlbums: (artistId: string) => Promise<any[]>;
  getRelatedArtists: (artistId: string) => Promise<any[]>;
  playPreview: (track: any) => Promise<void>;
  stopPlayback: () => Promise<void>;
  handlePlayPreview: (track: any) => void;
  togglePlayback: () => void;
  currentTrack: any;
  isPlaying: boolean;
};

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'spotifyclone', path: 'redirect' });
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    const initTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer(); 
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
        });
        console.log('✅ TrackPlayer initialized');
        setIsTrackPlayerReady(true);
      } catch (error: any) {
        if (
          error.message?.includes('already been initialized') ||
          error.toString().includes('already been initialized')
        ) {
          console.log('⚠️ TrackPlayer already initialized');
          setIsTrackPlayerReady(true); 
        } else {
          console.error('❌ Track Player setup error:', error);
        }
      }
    };
  
    initTrackPlayer();
  }, []);

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

      const tracks = json.tracks?.items|| [];
      const artists = json.artists?.items || [];

      const merged = [
        ...tracks.map((t: any) => ({ ...t, type: 'track' })),
        ...artists.map((a: any) => ({ ...a, type: 'artist' })),
      ];

      setSearchResults(merged);
    } catch (err) {
      console.error('Search failed:', err);
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

  const getRelatedArtists = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      return data.artists || [];
    } catch (error) {
      console.error('Failed to fetch related artists:', error);
      return [];
    }
  };

  const getArtistTopTracks = async (artistId: string) => {
    if (!accessToken) return [];
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
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

  const playPreview = async (track: any) => {
    if (!track.preview_url) {
      alert('No preview available for this track');
      return;
    }
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: track.preview_url,
        title: track.name,
        artist: track.artists?.map((a: any) => a.name).join(', '),
        artwork: track.album?.images?.[0]?.url,
      });
      await TrackPlayer.play();
    } catch (error) {
      console.error('Failed to play preview:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      await TrackPlayer.stop();
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const handlePlayPreview = async (track: any) => {
    if (!isTrackPlayerReady) {
      console.warn('⏳ TrackPlayer not ready yet.');
      return;
    }
  
    if (!track.preview_url) {
      alert('No preview available');
      return;
    }
  
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: track.preview_url,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        artwork: track.album.images?.[0]?.url,
      });
      await TrackPlayer.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else if (currentState === State.Paused) {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  const logout = async () => {
    await deleteToken();
    setUser(null);
    setAccessToken(null);
    setSearchResults([]);
    await TrackPlayer.reset();
  };

  const value = {
    user,
    accessToken,
    searchResults,
    login: () => promptAsync(),
    searchTracks,
    logout,
    isLoading,
    getArtist,
    getArtistTopTracks,
    getArtistAlbums,
    getRelatedArtists,
    playPreview,
    stopPlayback,
    handlePlayPreview,
    togglePlayback,
    currentTrack,
    isPlaying,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error('useSpotify must be used within SpotifyProvider');
  return context;
};