import TrackCard from '@/components/TrackCard';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type ArtistScreenProps = {
  artistId: string;
};

export default function ArtistScreen({ artistId }: ArtistScreenProps) {
    const { 
        accessToken, 
        getArtist, 
        getArtistTopTracks, 
        getArtistAlbums, 
      } = useSpotify();
  const router = useRouter();

  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTracks, setShowAllTracks] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const fetchArtistData = async () => {
        try {
          const [artistRes, tracksRes, albumsRes] = await Promise.all([
            getArtist(artistId),
            getArtistTopTracks(artistId),
            getArtistAlbums(artistId),
          ]);
      
          setArtist(artistRes);
          setTopTracks(tracksRes || []);
          setAlbums(albumsRes || []);
        } catch (err) {
          console.error('Error loading artist:', err);
        } finally {
          setLoading(false);
        }
      };

    fetchArtistData();
  }, [artistId, accessToken]);

  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 5);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.white }}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: artist.images?.[0]?.url }} style={styles.headerImage} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.artistName}>{artist.name}</Text>
      </View>

      {/* Details under image */}
      <View style={styles.detailsRow}>
        <Text style={styles.listeners}>
          {Intl.NumberFormat().format(artist.followers?.total || 0)} monthly listeners
        </Text>
       
      </View>

      {/* Playback buttons */}
      <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.ellipsisButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shuffleButton}>
          <Ionicons name="shuffle" size={30} color= {COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={30} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* Popular tracks */}
      <Text style={styles.sectionTitle}>Popular</Text>
      {displayedTracks.map((track, index) => (
        <TrackCard 
          key={track.id} 
          track={track} 
          showNumber 
          number={index + 1}
          subtitle={Intl.NumberFormat().format(Math.round((track.popularity / 100) * 1000000))} showEllipsis
        />
      ))}

        {topTracks.length > 5 && (
        <TouchableOpacity 
            style={styles.seeMoreButton}
            onPress={() => setShowAllTracks(!showAllTracks)}
        >
            <Text style={styles.seeMoreText}>
            {showAllTracks ? 'See less' : 'See more'}
            </Text>
        </TouchableOpacity>
        )}

        {/* Releases Section */}
        {albums.length > 0 && (
  <>
    <Text style={styles.sectionTitle}>Releases</Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.albumsContainer}
    >
      {albums.map(album => (
        <TouchableOpacity 
          key={album.id} 
          style={styles.albumCard}
          onPress={() =>
            router.push({
              pathname: '/(drawer)/media/[mediaId]',
              params: { mediaId: album.id },
            })
          }
        >  
            <Image 
            source={{ uri: album.images?.[0]?.url }} 
            style={styles.albumImage} 
          />
          <Text style={styles.albumName} numberOfLines={1}>
            {album.name}
          </Text>
          <Text style={styles.albumYear}>
            {new Date(album.release_date).getFullYear()} • {album.album_type}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
)}
        </ScrollView>
        );
        }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerImageContainer: {
    width,
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  artistName: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    color: COLORS.white,
    fontSize: 28,
    fontFamily: FONTS.dmSansBold,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: '#00000088',
    padding: 6,
    borderRadius: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  listeners: {
    color: COLORS.gray,
    fontSize: 14,
    flex: 1,
  },
  followButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  ellipsisButton: {
    padding: 8,
    marginLeft: 16,
  },
  shuffleButton: {
    backgroundColor: 'transparent',
    padding: 8,
    marginLeft: 'auto', 
    marginRight: 16,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, 
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  seeMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 130,
    marginTop: 8,
    marginBottom: 16,
    borderColor: COLORS.white,
    borderWidth: 1,
    borderRadius:20,
  },
  seeMoreText: {
    color: COLORS.white, 
    fontSize: 14,
    fontWeight: '600',
    },
  albumsContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  albumCard: {
    width: 140,
    marginRight: 16,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 4,
    marginBottom: 8,
  },
  albumName: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.dmSansBold,
    marginBottom: 4,
  },
  albumYear: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.dmSans,
  },
});