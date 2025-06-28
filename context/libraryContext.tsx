import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSpotify } from './spotifyContext';

interface Playlist {
  id: string;
  name: string;
  image?: string;
  tracks?: number;
  owner?: string;
  isSpotifyOwned?: boolean;
  type: string;
}

interface LibraryContextType {
  playlists: Playlist[];
  likedSongs: any[];
  shows: any[];
  albums: any[];
  artists: any[];
  fetchLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useSpotify();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  const fetchAllPages = async (url: string) => {
    let results: any[] = [];
    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      results = [...results, ...(data.items || [])];
      url = data.next;
    }
    return results;
  };

  const fetchLibrary = async () => {
    if (!accessToken) return;
  
    try {
      // Fetch playlists
      const playlistRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const playlistData = await playlistRes.json();
      const userPlaylists = playlistData.items.map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0]?.url || '',
        owner: p.owner.display_name,
        type: 'playlist',
      }));
  
      // Fetch liked songs
      const likedItems = await fetchAllPages('https://api.spotify.com/v1/me/tracks?limit=50');
      const likedSongs = likedItems.map((i: any) => i.track);
  
      // Fetch followed shows (podcasts)
      const showsRes = await fetch('https://api.spotify.com/v1/me/shows?limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const showsData = await showsRes.json();
      const shows = showsData.items.map((s: any) => ({
        id: s.show.id,
        name: s.show.name,
        image: s.show.images?.[0]?.url || s.show.icons?.[0]?.url || '',
        owner: s.show.publisher,
        type: 'podcast',
      }));
  
      const albumsRes = await fetch('https://api.spotify.com/v1/me/albums?limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const albumsData = await albumsRes.json();
      const albums = albumsData.items.map((a: any) => ({
        id: a.album.id,
        name: a.album.name,
        image: a.album.images?.[0]?.url || '',
        owner: a.album.artists.map((ar: any) => ar.name).join(', '),
        type: 'album',
      }));
  
      const artistsRes = await fetch('https://api.spotify.com/v1/me/following?type=artist&limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const artistsData = await artistsRes.json();
      const artists = artistsData.artists.items.map((a: any) => ({
        id: a.id,
        name: a.name,
        image: a.images?.[0]?.url || '',
        owner: '',
        type: 'artist',
      }));
  
      setPlaylists(userPlaylists);
      setLikedSongs(likedSongs);
      setShows(shows);
      setAlbums(albums);
      setArtists(artists);
  
    } catch (err) {
      console.error('Error fetching library:', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [accessToken]);

  return (
    <LibraryContext.Provider value={{ playlists, likedSongs, shows, albums, artists, fetchLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
};