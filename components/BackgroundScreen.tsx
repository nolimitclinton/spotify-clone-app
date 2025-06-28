import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../constants/images';
import { COLORS, FONTS } from '../constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export default function BackgroundScreen({ children, scroll = true }: Props) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <View style={styles.wrapper}>
      <Wrapper contentContainerStyle={styles.container}>
        {children}
      </Wrapper>

      <View style={styles.browseCard}>
        <Image source={IMAGES.doja} style={styles.browseImage} />
        <View style={styles.browseText}>
          <Text style={styles.browseTitle}>No Track Playing</Text>
          <Text style={styles.browseArtist}>Start browsing to play a song</Text>
        </View>
        <TouchableOpacity style={styles.featuredAddButton}>
          <Image source={IMAGES.tv} style={styles.connectButton} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.featuredAddButton}>
          <Ionicons name="play" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  container: {
    paddingTop: 80,
    paddingBottom: 130,
    paddingHorizontal: 16,
  },
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.song,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  browseImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  browseText: {
    flex: 1,
  },
  browseTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: FONTS.dmSans,
  },
  browseArtist: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: FONTS.dmSans,
  },
  featuredAddButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    width: 20,
    height: 20,
    tintColor: COLORS.white,
    resizeMode: 'contain',
    right: 20,
  },
});