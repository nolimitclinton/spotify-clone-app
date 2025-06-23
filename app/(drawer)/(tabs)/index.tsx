import BackgroundScreen from '@/components/BackgroundScreen';
import { IMAGES } from '@/constants/images';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { DrawerActions, useNavigation } from '@react-navigation/native';

import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RootDrawerParamList = {
  '(tabs)': undefined;
};

const categories = ['All', 'Music', 'Podcasts', 'Wrapped'];

const mixes = [
  { id: '1', name: 'just hits', image: IMAGES.justHits },
  { id: '2', name: 'Christmas Vibes 2023 🎄', image: IMAGES.christmas },
  { id: '3', name: 'On Repeat', image: IMAGES.onRepeat },
  { id: '4', name: 'Daily Mix 1', image: IMAGES.dailymix },
  { id: '5', name: 'baddie.', image: IMAGES.baddie },
  { id: '6', name: 'Ariana Grande Radio', image: IMAGES.ariana },
  { id: '7', name: 'K-Pop Gaming', image: IMAGES.kpop },
  { id: '8', name: 'Missed Hits', image: IMAGES.missedHits },
];

const HomeScreen = () => {
  const { user } = useSpotify();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
const openDrawer = () => {
  navigation.dispatch(DrawerActions.openDrawer());
};
  const [activeCategory, setActiveCategory] = useState('All');

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
              onPress={openDrawer}
              style={styles.avatarWrapper}
            >
              <Image 
                source={user?.images?.[0]?.url ? { uri: user.images[0].url } : IMAGES.defaultAvatar} 
                style={styles.avatar} 
              />
            </TouchableOpacity>

            {categories.map(cat => {
              const isActive = cat === activeCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    isActive && { backgroundColor: COLORS.primary },
                  ]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && { color: COLORS.background },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {mixes.map(mix => (
            <View key={mix.id} style={styles.tile}>
              <Image source={mix.image} style={styles.tileImage} />
              <Text style={styles.tileText}>{mix.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Picked for you</Text>
        <View style={styles.featuredTile}>
          <TouchableOpacity style={styles.featuredAddButton}>
            <Image source={IMAGES.add} style={styles.iconButton} />
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

          <TouchableOpacity style={styles.featuredPlayButton}>
            <Ionicons name="play-circle" size={32} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Trending albums for you</Text>
        <View style={styles.trendingRow}>
          <Image source={IMAGES.trending1} style={styles.trendingImage} />
          <Image source={IMAGES.trending2} style={styles.trendingImage} />
          <Image source={IMAGES.trending3} style={styles.trendingImage} />
        </View>
      </View>
    </BackgroundScreen>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 70, 
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
  
  logout: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
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
  featuredAddButton: {
    position: 'absolute',
    left: 175,
    bottom: 12,
    zIndex: 1,
  },
  featuredPlayButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    zIndex: 1,
  },
  iconButton: {
    width: 24,
    height: 24,
    tintColor: COLORS.gray,
  },
});