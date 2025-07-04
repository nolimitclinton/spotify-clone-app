import BackgroundScreen from '@/components/BackgroundScreen';
import TrackCard from '@/components/TrackCard';
import { COLORS } from '@/constants/theme';
import { useLibrary } from '@/context/libraryContext';
import { usePlaylist } from '@/context/playlistContext';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams();
  const id = Array.isArray(playlistId) ? playlistId[0] : playlistId;

  const { accessToken, searchTracks, searchResults, playTrack } = useSpotify();
  const { playlists, editPlaylist, addToPlaylist, removeFromPlaylist, getPlaylistTracks } = usePlaylist();
  const { likedSongs } = useLibrary();
  const navigation = useNavigation();

  const [tracks, setTracks] = useState<any[]>([]);
  const [playlistInfo, setPlaylistInfo] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlaylist = async () => {
      const selected = playlists.find((p) => p.id === id);

      if (!selected) {
        setPlaylistInfo(null);
        setTracks([]);
        return;
      }

      setPlaylistInfo(selected);
      setNewPlaylistName(selected.name);

      const fetchedTracks = await getPlaylistTracks(id);
      setTracks(fetchedTracks);
    };

    fetchPlaylist();
  }, [playlistId, playlists]);

  const handleRemove = async (trackId: string) => {
    try {
      await removeFromPlaylist(id, `spotify:track:${trackId}`);
      setTracks((prev) => prev.filter((track) => track.id !== trackId));
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  };

  const handlePlayPlaylist = (shuffle = false) => {
    if (tracks.length === 0) return;
    const selectedTrack = shuffle
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[0];
    playTrack(selectedTrack);
  };

  const handleAddToPlaylist = async (track: any) => {
    try {
      await addToPlaylist(id, track);
      setTracks((prev) => [...prev, track]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add track:', err);
    }
  };

  const handleEditPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      await editPlaylist(id, newPlaylistName);
      setPlaylistInfo((prev: any) => ({ ...prev, name: newPlaylistName }));
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to edit playlist:', err);
    }
  };

  return (
    <BackgroundScreen scroll={false}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => setShowEditModal(true)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {playlistInfo && (
        <View style={styles.header}>
          <Image
            source={{ uri: playlistInfo.image || 'https://via.placeholder.com/150' }}
            style={styles.cover}
          />
          <Text style={styles.name}>{playlistInfo.name}</Text>
          <Text style={styles.trackCount}>{tracks.length} Songs</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={() => handlePlayPlaylist(true)}
            >
              <Ionicons name="shuffle" size={20} color={COLORS.background} />
              <Text style={styles.buttonText}>Shuffle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={() => handlePlayPlaylist(false)}
            >
              <Ionicons name="play" size={20} color={COLORS.background} />
              <Text style={styles.buttonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TrackCard
            track={item}
            number={index + 1}
            showNumber
            showEllipsis
            onRemoveFromPlaylist={() => handleRemove(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tracks in this playlist.</Text>}
      />

      {/* Add Songs Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Songs</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for songs..."
                placeholderTextColor={COLORS.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchTracks(searchQuery)}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => searchTracks(searchQuery)}
              >
                <Ionicons name="search" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={Array.isArray(searchResults) ? searchResults : []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const imageUrl =
                  item?.album?.images?.[0]?.url ?? 'https://via.placeholder.com/50';
                const artists = Array.isArray(item?.artists)
                  ? item.artists.map((a: { name: any; }) => a.name).join(', ')
                  : 'Unknown Artist';

                return (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleAddToPlaylist(item)}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.searchResultImage} />
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>
                        {item?.name ?? 'Unknown Title'}
                      </Text>
                      <Text style={styles.searchResultArtist} numberOfLines={1}>
                        {artists}
                      </Text>
                    </View>
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                searchQuery ? (
                  <Text style={styles.emptySearch}>No results found</Text>
                ) : (
                  <Text style={styles.emptySearch}>Search for songs to add</Text>
                )
              }
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Playlist Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Edit Playlist</Text>

            <TextInput
              style={styles.editInput}
              placeholder="Playlist name"
              placeholderTextColor={COLORS.gray}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveEditButton}
                onPress={handleEditPlaylist}
              >
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
       </BackgroundScreen>
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
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10, 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingTop: 50, 
    paddingHorizontal: 16,
  },
  editButton: {
    padding: 8,
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
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 16,
  },
  empty: {
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginTop: 8,
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
  addButton: {
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  editModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    color: COLORS.white,
    fontSize: 16,
  },
  searchResultArtist: {
    color: COLORS.gray,
    fontSize: 14,
  },
  emptySearch: {
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 20,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  editInput: {
    backgroundColor: COLORS.background,
    color: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  editButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelEditButton: {
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveEditButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});