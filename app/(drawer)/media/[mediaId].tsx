import BackgroundScreen from '@/components/BackgroundScreen';
import { COLORS, FONTS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MediaDetailScreen() {
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();
  const { accessToken } = useSpotify();
  const router = useRouter();

  const [media, setMedia] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !mediaId) return;

    const fetchMedia = async () => {
      try {
        const showRes = await fetch(`https://api.spotify.com/v1/shows/${mediaId}?market=US`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (showRes.ok) {
          const showData = await showRes.json();
          const episodesRes = await fetch(
            `https://api.spotify.com/v1/shows/${mediaId}/episodes?market=US&limit=20`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const episodesData = await episodesRes.json();
          setMedia({ ...showData, type: 'podcast' });
          setItems(episodesData.items || []);
          return;
        }
        const albumRes = await fetch(`https://api.spotify.com/v1/albums/${mediaId}?market=US`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (albumRes.ok) {
          const albumData = await albumRes.json();
          setMedia({ ...albumData, type: 'album' });
          setItems(albumData.tracks?.items || []);
        } else {
          setMedia(null);
        }
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setMedia(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [accessToken, mediaId]);

  if (isLoading) {
    return (
      <BackgroundScreen scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </BackgroundScreen>
    );
  }

  if (!media) {
    return (
      <BackgroundScreen>
        <Text style={styles.errorText}>Media not found.</Text>
      </BackgroundScreen>
    );
  }

  return (
    <BackgroundScreen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={28} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.container}>
              <Image source={{ uri: media.images?.[0]?.url }} style={styles.image} />
              <Text style={styles.title}>{media.name}</Text>
              <Text style={styles.publisher}>{media.publisher || media.artists?.[0]?.name}</Text>
              <Text style={styles.description}>
                {media.description || media.label || media.release_date}
              </Text>
              <Text style={styles.episodesHeading}>
                {media.type === 'podcast' ? 'Episodes' : 'Tracks'}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
            const rawDate = media.type === 'podcast'
            ? item.release_date || item.added_at
            : media.release_date;
            let formattedDate = 'Unknown date';
          
            try {
              if (rawDate) {
                formattedDate = format(parseISO(rawDate), 'MMM d, yyyy');
              }
            } catch (e) {
              console.warn('Invalid date format for album:', rawDate);
            }
          
            return (
              <View style={styles.episodeCard}>
                <Text style={styles.episodeTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.episodeInfo}>
                  {formattedDate} • {Math.round(item.duration_ms / 60000)} min
                </Text>
              </View>
            );
          }}
        ListEmptyComponent={
          <Text style={styles.errorText}>
            {media.type === 'podcast' ? 'No episodes available.' : 'No tracks found.'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  publisher: {
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  episodesHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 12,
    marginBottom: 10,
  },
  episodeCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  episodeTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.dmSans,
  },
  episodeInfo: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.gray,
    paddingTop: 100,
  },
});