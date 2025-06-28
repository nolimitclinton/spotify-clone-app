import TrackCard from '@/components/TrackCard';
import { COLORS } from '@/constants/theme';
import { useLibrary } from '@/context/libraryContext';
import { usePlaylist } from '@/context/playlistContext';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams();
  const { accessToken } = useSpotify();
  const { playlists } = usePlaylist();
  const { likedSongs } = useLibrary();
  const navigation = useNavigation();
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<any>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      const selected = playlists.find((p) => p.id === playlistId);

      if (!selected) {
        setPlaylistInfo(null);
        setTracks([]);
        return;
      }

      setPlaylistInfo(selected);

      try {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setTracks(
          data.items
            .filter((item: any) => item.track && item.track.uri) 
            .map((item: any) => ({
              id: item.track.id,
              name: item.track.name,
              uri: item.track.uri,
              album: item.track.album,
              artists: item.track.artists,
            }))
        );
      } catch (err) {
        console.error('Failed to load playlist tracks:', err);
      }
    };

    fetchPlaylist();
  }, [playlistId, playlists]);
  const handleRemove = async (trackId: string) => {
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracks: [{ uri: `spotify:track:${trackId}` }],
        }),
      });
  
      const data = await res.json();
      console.log('Remove response:', data);
      setTracks(tracks.filter(track => track.id !== trackId));
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {playlistInfo && (
        <View style={styles.header}>
          <Image
            source={{ uri: playlistInfo.image || 'https://via.placeholder.com/150' }}
            style={styles.cover}
          />
          <Text style={styles.name}>{playlistInfo.name}</Text>
          <Text style={styles.trackCount}>{tracks.length} Songs</Text>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TrackCard track={item} number={index + 1} showNumber showEllipsis onRemoveFromPlaylist={() => handleRemove(item.id)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tracks in this playlist.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  trackCount: {
    color: COLORS.gray,
    fontSize: 14,
  },
  empty: {
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
});