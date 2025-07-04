import type { Track } from '@/context/spotifyContext';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import PlaylistModal from './PlaylistModal';

type TrackCardProps = {
  track: Track;
  showNumber?: boolean;
  number?: number;
  subtitle?: string;
  showEllipsis?: boolean;
  onRemoveFromPlaylist?: () => void;
};

export default function TrackCard({
  track,
  showNumber = false,
  number,
  subtitle,
  showEllipsis = false,
  onRemoveFromPlaylist,
}: TrackCardProps) {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { playTrack } = useSpotify();

  const handlePress = () => {
    try {
      playTrack(track);
    } catch (err) {
      console.error('Error playing track:', err);
      Alert.alert('Error', 'Could not play this track.');
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
        {showNumber && <Text style={styles.trackNumber}>{number}</Text>}
        <Image
          source={{ uri: track.album.images?.[0]?.url || 'https://via.placeholder.com/50' }}
          style={styles.image}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>{track.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || (Array.isArray(track.artists) ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist')}
          </Text>
        </View>

        {showEllipsis && (
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.trackEllipsis}>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                setShowPlaylistModal(true);
              }}>
              <Text style={styles.menuOption}>Add to Playlist</Text>
            </TouchableOpacity>

            {onRemoveFromPlaylist && (
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  onRemoveFromPlaylist();
                }}>
                <Text style={styles.menuOption}>Remove from Playlist</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        track={track}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
  },
  trackNumber: {
    color: COLORS.gray,
    width: 24,
    marginRight: 12,
    fontSize: 14,
    fontFamily: FONTS.dmSans,
    textAlign: 'right',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.dmSansBold,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.dmSans,
  },
  trackEllipsis: {
    padding: 8,
    marginLeft: 'auto',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 40,
  },
  menu: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
  },
  menuOption: {
    color: COLORS.white,
    fontSize: 16,
    paddingVertical: 8,
  },
});