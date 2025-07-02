import BackgroundScreen from '@/components/BackgroundScreen';
import { IMAGES } from '@/constants/images';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'playlists', name: 'Playlists' },
  { id: 'albums', name: 'Albums' },
  { id: 'artists', name: 'Artists' },
  //{ id: 'featured', name: 'Featured' },
];

const HomeScreen = () => {
  const router = useRouter();
  const { 
    user, 
    accessToken,
    featuredPlaylists,
    newReleases,
    userPlaylists,
    topArtists,
    getTopArtists,
    //getFeaturedPlaylists,
    getNewReleases,
    getUserPlaylists,
    topTracks,
    getTopTracks,
    isLoading
  } = useSpotify();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryPlaylists, setCategoryPlaylists] = useState<any[]>([]);

  const handleItemPress = (item: any) => {
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

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          //getFeaturedPlaylists(),
          getNewReleases(),
          getUserPlaylists(),
          getTopArtists(),
          getTopTracks(),
        ]);

        const categoriesRes = await fetch(
          'https://api.spotify.com/v1/browse/categories?limit=6',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const categoriesData = (await categoriesRes.json()).categories?.items || [];
        setCategoriesList(categoriesData);

        if (categoriesData.length > 0) {
          const categoryPlaylistsRes = await fetch(
            `https://api.spotify.com/v1/browse/categories/${categoriesData[0].id}/playlists?limit=6`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setCategoryPlaylists((await categoryPlaylistsRes.json()).playlists?.items || []);
        }

      } catch (error) {
        console.error('Failed to fetch Spotify data:', error);
      }
    };

    fetchData();
  }, [accessToken]);

  const renderItem = (item: any, type: string) => {
    const itemWithType = { ...item, type };
    const imageUrl =
      item.images?.[0]?.url ||                  
      item.album?.images?.[0]?.url ||           
      IMAGES.doja;                              
  
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.tile}
        onPress={() => handleItemPress(itemWithType)}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.tileImage} 
        />
        <Text style={styles.tileText} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  const renderContent = () => {
    switch (activeCategory) {
      case 'all':
        return (
          <>
            <Text style={styles.sectionTitle}>Your playlists</Text>
            <View style={styles.grid}>
              {userPlaylists.map(item => renderItem(item, 'playlist'))}
            </View>

            <Text style={styles.sectionTitle}>New releases</Text>
            <View style={styles.grid}>
              {newReleases.map(item => renderItem(item, 'album'))}
            </View>

            <Text style={styles.sectionTitle}>Top artists</Text>
            <View style={styles.grid}>
              {topArtists.map(item => renderItem(item, 'artist'))}
            </View>
            
            <Text style={styles.sectionTitle}>Top tracks</Text>
            <View style={styles.grid}>
              {topTracks.map(item => renderItem(item, 'track'))}
            </View>
          </>
        );
      case 'playlists':
        return (
          <>
            <Text style={styles.sectionTitle}>Your playlists</Text>
            <View style={styles.grid}>
              {userPlaylists.map(item => renderItem(item, 'playlist'))}
            </View>

            {/* <Text style={styles.sectionTitle}>Featured playlists</Text>
            <View style={styles.grid}>
              {featuredPlaylists.map(item => renderItem(item, 'playlist'))}
            </View> */}
          </>
        );
      case 'albums':
        return (
          <>
            <Text style={styles.sectionTitle}>New releases</Text>
            <View style={styles.grid}>
              {newReleases.map(item => renderItem(item, 'album'))}
            </View>
          </>
        );
      case 'artists':
        return (
          <>
            <Text style={styles.sectionTitle}>Top artists</Text>
            <View style={styles.grid}>
              {topArtists.map(item => renderItem(item, 'artist'))}
            </View>
          </>
        );
      case 'featured':
        return (
          <>
            <Text style={styles.sectionTitle}>Featured playlists</Text>
            <View style={styles.grid}>
              {featuredPlaylists.map(item => renderItem(item, 'playlist'))}
            </View>

            {categoriesList.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>{categoriesList[0].name}</Text>
                <View style={styles.grid}>
                  {categoryPlaylists.map(item => renderItem(item, 'playlist'))}
                </View>
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <BackgroundScreen scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </BackgroundScreen>
    );
  }

  return (
    <BackgroundScreen>
      <View style={styles.content}>
        <View style={styles.topBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topBarScroll}
          >
            <TouchableOpacity 
              onPress={() => router.push('/(drawer)/(tabs)/explore')}
              style={styles.avatarWrapper}
            >
              <Image 
                source={user?.images?.[0]?.url ? { uri: user.images[0].url } : IMAGES.defaultAvatar} 
                style={styles.avatar} 
              />
            </TouchableOpacity>

            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  activeCategory === cat.id && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat.id && { color: COLORS.background },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView>
          {renderContent()}
        </ScrollView>
      </View>
    </BackgroundScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 70, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarContainer: {
    marginBottom: 16,
  },
  topBarScroll: {
    alignItems: 'center',
    paddingRight: 16,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  categoryButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.dmSans,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    borderRadius: 8,
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '48%',
  },
  tileImage: {
    width: 56,
    height: 56,
    marginRight: 10,
    borderRadius: 4,
  },
  tileText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.dmSans,
    flexShrink: 1, 
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
});

export default HomeScreen;