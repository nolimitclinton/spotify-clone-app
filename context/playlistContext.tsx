import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSpotify } from './spotifyContext';

interface Track {
  id: string;
  name: string;
  uri: string;
  album: { images: { url: string }[] };
  artists: { name: string }[];
}

interface Playlist {
  id: string;
  name: string;
  image?: string;
  tracks?: Track[]; 
}

interface PlaylistContextType {
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  createPlaylist: (name: string) => Promise<Playlist | null>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  editPlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  clearError: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useSpotify();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchPlaylists = async () => {
    if (!accessToken || !user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playlists');
      }

      const data = await res.json();
      const remote = data.items.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.url,
      }));
      setPlaylists(remote);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async (name: string) => {
    if (!accessToken || !user) {
      setError('No access token or user');
      return null;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: 'Created from Spotify Clone App',
          public: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to create playlist');
      }

      const data = await res.json();
      await fetchPlaylists();
      return data;
    } catch (err) {
      console.error('Create playlist failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    if (!accessToken) {
      setError('No access token');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [track.uri] }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add track');
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Add to playlist failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add track');
    } finally {
      setIsLoading(false);
    }
  };

  const editPlaylist = async (playlistId: string, name: string, description = '') => {
    if (!accessToken) {
      setError('No access token');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to edit playlist');
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Edit playlist failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!accessToken) {
      setError('No access token');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to delete playlist');
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Delete playlist failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete playlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user) {
      fetchPlaylists();
    }
  }, [accessToken, user]);

  const value = useMemo(() => ({
    playlists,
    isLoading,
    error,
    createPlaylist,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    fetchPlaylists,
    clearError,
  }), [playlists, isLoading, error]);

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error('usePlaylist must be used within PlaylistProvider');
  return context;
};