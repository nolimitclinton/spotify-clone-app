import TrackCard from '@/components/TrackCard';
import { COLORS } from '@/constants/theme';
import { useLibrary } from '@/context/libraryContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LikedSongsScreen() {
  const { likedSongs } = useLibrary();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.header}>
        {/* <Image
          source={{ uri: likedSongs?.[0]?.album?.images?.[0]?.url || 'https://via.placeholder.com/150' }}
          style={styles.cover}
        /> */}
        <Text style={styles.name}>Liked Songs</Text>
        <Text style={styles.trackCount}>{likedSongs.length} Songs</Text>
      </View>

      <FlatList
        data={likedSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TrackCard
            track={item}
            number={index + 1}
            showNumber
            showEllipsis
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No liked songs.</Text>}
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
    color: '#aaa',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
});