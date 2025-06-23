import BackgroundScreen from '@/components/BackgroundScreen';
import { COLORS, FONTS } from '@/constants/theme';
import { usePlaylist } from '@/context/playlistContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LibraryScreen() {
  const { playlists, fetchPlaylists, createPlaylist } = usePlaylist();
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    if (!playlistName.trim()) return;
    setCreating(true);
    await createPlaylist(playlistName);
    setPlaylistName('');
    setModalVisible(false);
    setCreating(false);
  };

  const renderPlaylistCard = ({ item }: any) => {
    const isLocal = !!item.isLocal;
    const imageUrl =
      item.images?.[0]?.url ||
      item.image ||
      'https://via.placeholder.com/60';
    const trackCount = item.tracks?.length || item.tracks?.total || 5;

    return (
      <TouchableOpacity
        style={styles.playlistCard}
        onPress={() =>
          router.push({
            pathname: '/(drawer)/playlist/[playlistId]',
            params: { playlistId: item.id, isLocal: String(isLocal) },
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.playlistImage} />
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{item.name}</Text>
          <Text style={styles.trackCount}>{trackCount} songs</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundScreen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.heading}>Your Library</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.createButtonText}>+ Create Playlist</Text>
        </TouchableOpacity>

        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistCard}
          ListEmptyComponent={<Text style={styles.empty}>No playlists yet.</Text>}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              placeholder="Playlist Name"
              value={playlistName}
              onChangeText={setPlaylistName}
              style={styles.input}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={handleCreate} disabled={creating} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{creating ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {  padding: 20, paddingTop: 80,backgroundColor: COLORS.background },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 26 },
  createButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginBottom: 16 },
  createButtonText: { color: COLORS.white, textAlign: 'center', fontFamily: FONTS.dmSans },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  playlistImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  playlistInfo: { flex: 1 },
  playlistName: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.dmSans },
  trackCount: { color: '#999', fontSize: 12 },
  empty: { color: '#999', textAlign: 'center', marginTop: 40 },
  modalBackground: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: COLORS.primary, margin: 20, padding: 20, borderRadius: 8 },
  modalTitle: { color: COLORS.white, fontSize: 18, marginBottom: 12 },
  input: { backgroundColor: '#333', color: COLORS.white, padding: 10, borderRadius: 6, marginBottom: 12 },
  saveButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 6, marginBottom: 8 },
  saveButtonText: { color: COLORS.white, textAlign: 'center' },
  cancelText: { color: '#aaa', textAlign: 'center' },
});