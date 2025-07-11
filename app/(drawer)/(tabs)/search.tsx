import ArtistCard from '@/components/ArtistCard';
import BackgroundScreen from '@/components/BackgroundScreen';
import PlaylistModal from '@/components/PlaylistModal';
import TrackCard from '@/components/TrackCard';
import { IMAGES } from '@/constants/images';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SearchScreen() {
  const { user, searchTracks, searchResults } = useSpotify();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchTracks(query);
        if (!recentSearches.includes(query)) {
          setRecentSearches((prev) => [query, ...prev.slice(0, 9)]);
        }
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const clearRecent = () => setRecentSearches([]);
  const removeRecent = (term: string) =>
    setRecentSearches((prev) => prev.filter((t) => t !== term));

  const openPlaylistModal = (track: any) => {
    setSelectedTrack(track);
    setModalVisible(true);
  };

  return (
    <BackgroundScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {user?.images?.[0]?.url && (
            <Image source={{ uri: user.images[0].url }} style={styles.avatar} />
          )}
          <Text style={styles.title}>Search</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            placeholder="What do you want to listen to?"
            placeholderTextColor= {COLORS.background}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setShowSearchResults(true)}
          />
          {showSearchResults && (
            <TouchableOpacity onPress={() => { setQuery(''); setShowSearchResults(false); }}>
              <Text style={{ color: COLORS.background, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {showSearchResults ? (
          <>
            {recentSearches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecent}>
                    <Text style={{ color: COLORS.primary }}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((item) => (
                  <View key={item} style={styles.recentItem}>
                    <TouchableOpacity onPress={() => setQuery(item)}>
                      <Text style={{ color: COLORS.white }}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecent(item)}>
                      <Ionicons name="close" size={16} color={COLORS.gray} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {searchResults.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {searchResults.map((item) =>
                  item.type === 'track' ? (
                    <TrackCard key={item.id} track={item}  showEllipsis/>
                  ) : (
                    <ArtistCard key={item.id} artist={item} />
                  )
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Picked for you</Text>
                    <View style={styles.featuredTile}>
                      <TouchableOpacity style={styles.featuredAddButton}>
                      <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.white} />
                      </TouchableOpacity>
            
                      <View style={styles.featuredContent}>
                        <Image source={IMAGES.kpop} style={styles.featuredImage} />
                        <View style={styles.featuredTextContainer}>
                          <Text style={styles.featuredLabel}>Playlist</Text>
                          <Text style={styles.featuredTitle}>K-Pop Gaming</Text>
                          <Text style={styles.featuredDescription}>
                            Enjoy fantastic gameplay with k-pop music!
                          </Text>
                        </View>
                      </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={18} color={COLORS.background} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Explore your genres</Text>
            <View style={styles.genreRow}>
              <View style={styles.genreTile}>
                <Image source={IMAGES.cozy} style={styles.genreImage} />
                {/* <Text style={styles.genreLabel}>#cozy</Text> */}
              </View>
              <View style={styles.genreTile}>
                <Image source={IMAGES.korean} style={styles.genreImage} />
                {/* <Text style={styles.genreLabel}>#korean indie</Text> */}
              </View>
              <View style={styles.genreTile}>
                <Image source={IMAGES.healing} style={styles.genreImage} />
                {/* <Text style={styles.genreLabel}>#healing</Text> */}
              </View>          
            </View>
              <Text style={styles.sectionTitle}>Browse all</Text>
                  <View style={styles.trendingRow}>
                    <Image source={IMAGES.trending1} style={styles.trendingImage} />
                    <Image source={IMAGES.trending2} style={styles.trendingImage} />
                    <Image source={IMAGES.trending3} style={styles.trendingImage} />
                    </View>
            
          </>
        )}
      </ScrollView>

      <PlaylistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        track={selectedTrack}
      />
    </BackgroundScreen>
  );
}


const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: 40, color: COLORS.background },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 24,
    position: 'relative',
  },
  cardImage: { width: 80, height: 80, borderRadius: 6 },
  cardDetails: { flex: 1, marginLeft: 12 },
  cardLabel: { color: '#ccc', fontSize: 12, marginBottom: 2 },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#999', fontSize: 12 },
  playButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  genreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  genreTile: { flex: 1 },
  genreImage: { width: '100%', height: 200, borderRadius: 8 },
  genreLabel: {
    color: COLORS.white,
    marginTop: 6,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  featuredTile: {
    position: 'relative',
    backgroundColor: COLORS.surface,
    marginBottom: 20,
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTextContainer: {
    marginLeft: 12,
    flex: 1,
    marginBottom: 50,
  },
  featuredLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
    opacity: 0.7,
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.dmSans,
    marginTop: 4,
  },
  featuredDescription: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.dmSans,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  featuredImage: {
    width: 152,
    height: 152,
    borderRadius: 8,
  },
  featuredAddButton: {
    position: 'absolute',
    left: 175,
    bottom: 12,
    zIndex: 1,
  },
  trendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    gap: 12,
    marginBottom: 20,
  },
  
  trendingImage: {
    width: 130,
    height: 130,
    borderRadius: 8,
  },
});