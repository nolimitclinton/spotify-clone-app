import BackgroundScreen from '@/components/BackgroundScreen';
import { COLORS, FONTS } from '@/constants/theme';
import { useLibrary } from '@/context/libraryContext';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const FILTERS = ['Playlists', 'Podcasts', 'Albums', 'Artists'] as const;
type FilterType = (typeof FILTERS)[number] | 'All';

export default function LibraryScreen() {
  const { playlists, shows, albums, artists, likedSongs } = useLibrary();
   const { user } = useSpotify();
  const [filter, setFilter] = useState<FilterType>('All');
  const router = useRouter();

  const allItems = [
    {
      id: 'liked-songs',
      name: 'Liked Songs',
      image: likedSongs?.[0]?.album?.images?.[0]?.url || '',
      owner: 'You',
      type: 'playlist',
      isLiked: true,
    },
    ...playlists.map((p) => ({ ...p, type: 'playlist' })),
    ...shows.map((s) => ({ ...s, type: 'podcast' })),
    ...albums.map((a) => ({ ...a, type: 'album' })),
    ...artists.map((a) => ({ ...a, type: 'artist' })),
  ];

  const filteredItems = () => {
    if (filter === 'All') return allItems;
    
    const typeMap: Record<FilterType, string> = {
      'Playlists': 'playlist',
      'Podcasts': 'podcast',
      'Albums': 'album',
      'Artists': 'artist',
      'All': 'all'
    };
    
    return allItems.filter((item) => item.type === typeMap[filter]);
  };

  const renderCard = ({ item }: any) => {
    const onPress = () => {
      if (item.id === 'liked-songs') {
        router.push('/(drawer)/liked');
      
      } else if (item.type === 'playlist') {
        router.push({
          pathname: '/(drawer)/playlist/[playlistId]',
          params: { playlistId: item.id },
        });
      } else if (item.type === 'artist') {
        router.push({
          pathname: '/artist/[id]', 
          params: { id: item.id },
        });
      } else {
        router.push({
          pathname: '/(drawer)/media/[mediaId]',
          params: { mediaId: item.id },
        });
      }
    };

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/60' }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.typeText}>{item.owner}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundScreen scroll={false}>
      <View style={styles.container}>
        
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            {user?.images?.[0]?.url && (
              <Image source={{ uri: user.images[0].url }} style={styles.avatar} />
            )}
            <Text style={styles.title}>Your Library</Text>
          </View>
  
          <View style={styles.topRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="add-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
  
        <View style={styles.tabs}>
          {FILTERS.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[styles.tabButton, filter === type && styles.activeTab]}
            >
              <Text style={[styles.tabText, filter === type && styles.activeTabText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
          {filter !== 'All' && (
            <TouchableOpacity onPress={() => setFilter('All')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
  
        <FlatList
          data={filteredItems()}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
        />
      </View>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 80,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  iconButton: {
    marginLeft: 20,
  },

  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.gray,
    fontFamily: FONTS.dmSans,
  },
  activeTabText: {
    color: COLORS.white,
  },
  clearText: {
    color: COLORS.gray,
    fontSize: 18,
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.dmSans,
  },
  typeText: {
    color: '#999',
    fontSize: 12,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});