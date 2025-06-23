import TrackCard from '@/components/TrackCard';
import { COLORS } from '@/constants/theme';
import { usePlaylist } from '@/context/playlistContext';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlaylistDetailScreen() {
  const { playlistId, isLocal } = useLocalSearchParams();
  const { accessToken } = useSpotify();
  const { playlists } = usePlaylist();
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

      if (isLocal === 'true') {
        setTracks(selected.tracks || []);
      } else {
        try {
          const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          setTracks(data.items.map((item: any) => item.track));
        } catch (err) {
          console.error('Failed to load playlist tracks:', err);
        }
      }
    };
    fetchPlaylist();
  }, [playlistId, playlists]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {playlistInfo && (
        <View style={styles.header}>
          <Image
            source={{ uri: playlistInfo.images?.[0]?.url || playlistInfo.image || 'https://via.placeholder.com/150' }}
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
          <TrackCard track={item} number={index + 1} showNumber />
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
    paddingTop: 50, // Added space from top
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
    color: '#aaa',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
});