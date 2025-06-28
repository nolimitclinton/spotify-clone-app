import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<Playlist | null>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  editPlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  fetchPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useSpotify();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const fetchPlaylists = async () => {
    if (!accessToken || !user) return;
    try {
      const res = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      const remote = data.items.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.url,
      }));
      setPlaylists(remote);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const createPlaylist = async (name: string) => {
    if (!accessToken || !user) return null;
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
      const data = await res.json();
      await fetchPlaylists();
      return data;
    } catch (err) {
      console.error('Create playlist failed:', err);
      return null;
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    if (!accessToken) return;
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
      console.log(track.uri)
      const data = await response.json();
      console.log('Add to playlist response:', data);
  
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to add track.');
      }
  
      await fetchPlaylists();
    } catch (err) {
      console.error('Add to playlist failed:', err);
    }
  };
  const editPlaylist = async (playlistId: string, name: string, description = '') => {
    if (!accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      await fetchPlaylists();
    } catch (err) {
      console.error('Edit playlist failed:', err);
    }
  };

  const deletePlaylist = async (playlistId: string) => {

    if (!accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await fetchPlaylists();
    } catch (err) {
      console.error('Delete playlist failed:', err);
    }
  };

  useEffect(() => {
    if (accessToken && user) {
      fetchPlaylists();
    }
  }, [accessToken, user]);

  const value = {
    playlists,
    createPlaylist,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    fetchPlaylists,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error('usePlaylist must be used within PlaylistProvider');
  return context;
};