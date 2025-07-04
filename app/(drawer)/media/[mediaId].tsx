import BackgroundScreen from '@/components/BackgroundScreen';
import PlaylistModal from '@/components/PlaylistModal';
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
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function MediaDetailScreen() {
  const { mediaId } = useLocalSearchParams<{ mediaId: string }>();
  const { accessToken, playTrack } = useSpotify();
  const router = useRouter();

  const [media, setMedia] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

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

  const handlePlayMedia = (shuffle = false) => {
    if (!media || items.length === 0) return;
    const selectedTrack = shuffle
      ? items[Math.floor(Math.random() * items.length)]
      : items[0];
      playTrack({ ...selectedTrack, album: media });
  };

  const handleTrackOptions = (track: any) => {
    setSelectedTrack(track);
    setShowOptions(true);
  };

  const handleAddToPlaylist = () => {
    console.log('Add to playlist:', selectedTrack);
    setShowOptions(false);
    setShowPlaylistModal(true);
  };

  const handleViewArtist = () => {
    if (selectedTrack?.artists?.[0]?.id) {
      router.push(`/artist/${selectedTrack.artists[0].id}`);
      setShowOptions(false);
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
              
              {/* Play and Shuffle Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.shuffleButton}
                  onPress={() => handlePlayMedia(true)}
                >
                  <Ionicons name="shuffle" size={20} color={COLORS.background} />
                  <Text style={styles.buttonText}>Shuffle</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlayMedia(false)}
                >
                  <Ionicons name="play" size={20} color={COLORS.background} />
                  <Text style={styles.buttonText}>Play</Text>
                </TouchableOpacity>
              </View>

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
              <TouchableOpacity 
                style={styles.trackInfo}
                onPress={() => {
                  if (media.type === 'album') {
                    playTrack({ ...item, album: media });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.episodeTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.episodeInfo}>
                  {formattedDate} • {Math.round(item.duration_ms / 60000)} min
                </Text>
              </TouchableOpacity>
          
              <TouchableOpacity 
                onPress={() => handleTrackOptions(item)}
                style={styles.optionsButton}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
              </TouchableOpacity>
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

{/* Track Options Modal */}
<Modal
  visible={showOptions}
  transparent
  animationType="slide"
  onRequestClose={() => setShowOptions(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{selectedTrack?.name}</Text>

      <TouchableOpacity
        style={styles.modalOption}
        onPress={handleAddToPlaylist}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.modalOptionText}>Add to playlist</Text>
      </TouchableOpacity>

      {media.type === 'album' && (
        <TouchableOpacity
          style={styles.modalOption}
          onPress={handleViewArtist}
        >
          <Ionicons name="person" size={20} color={COLORS.white} />
          <Text style={styles.modalOptionText}>View artist</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.modalCancel}
        onPress={() => setShowOptions(false)}
      >
        <Text style={styles.modalCancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<PlaylistModal
  visible={showPlaylistModal}
  onClose={() => {
    setShowPlaylistModal(false);
    setSelectedTrack(null);
  }}
  track={selectedTrack}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginBottom: 20,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 32,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  optionsButton: {
    padding: 8,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    gap: 12,
  },
  modalOptionText: {
    color: COLORS.white,
    fontSize: 16,
  },
  modalCancel: {
    paddingVertical: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});