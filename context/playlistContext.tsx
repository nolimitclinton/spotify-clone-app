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
  isLocal?: boolean;
  tracks: Track[];
  image?: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, isLocal?: boolean) => Promise<Playlist | null>;
  addToPlaylist: (playlistId: string, track: Track, isLocal?: boolean) => Promise<void>;
  editPlaylist: (playlistId: string, name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => void;
  fetchPlaylists: () => Promise<void>;
  getPlaylistById: (id: string, isLocal?: boolean) => Playlist | undefined;
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useSpotify();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [localPlaylists, setLocalPlaylists] = useState<Playlist[]>([]);

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
        tracks: [],
        image: p.images?.[0]?.url,
        isLocal: false,
      }));
      setPlaylists([...localPlaylists, ...remote]);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setPlaylists([...localPlaylists]); 
    }
  };

  const createPlaylist = async (name: string, isLocal = false) => {
    if (isLocal) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        isLocal: true,
        tracks: [],
        image: 'https://via.placeholder.com/60',
      };
      setLocalPlaylists((prev) => [newPlaylist, ...prev]);
      setPlaylists((prev) => [newPlaylist, ...prev]);
      return newPlaylist;
    }

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

  const addToPlaylist = async (playlistId: string, track: Track, isLocal = false) => {
    if (isLocal) {
      setLocalPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p
        )
      );
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p
        )
      );
      return;
    }

    if (!accessToken) return;
    try {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [track.uri] }),
      });
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

  const deletePlaylist = (playlistId: string) => {
    setLocalPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const removeTrackFromPlaylist = (trackId: string, playlistId: string) => {
    setLocalPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      )
    );
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
          : p
      )
    );
  };

  const getPlaylistById = (id: string, isLocal = false): Playlist | undefined => {
    return playlists.find((p) => p.id === id && Boolean(p.isLocal) === isLocal);
  };

  useEffect(() => {
    if (accessToken && user) {
      fetchPlaylists();
    }
  }, [accessToken, user]);

  useEffect(() => {
    setPlaylists((prev) => {
      const remoteOnly = prev.filter((p) => !p.isLocal);
      return [...localPlaylists, ...remoteOnly];
    });
  }, [localPlaylists]);

  const value = {
    playlists,
    createPlaylist,
    addToPlaylist,
    editPlaylist,
    deletePlaylist,
    fetchPlaylists,
    getPlaylistById,
    removeTrackFromPlaylist,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error('usePlaylist must be used within PlaylistProvider');
  return context;
};