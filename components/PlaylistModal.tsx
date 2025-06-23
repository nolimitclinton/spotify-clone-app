import { COLORS } from '@/constants/theme';
import { usePlaylist } from '@/context/playlistContext';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  track: any;
}

export default function PlaylistModal({ visible, onClose, track }: Props) {
  const { playlists, fetchPlaylists, createPlaylist, addToPlaylist } = usePlaylist();
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) fetchPlaylists();
  }, [visible]);

  const handleAdd = async (playlistId: string) => {
    await addToPlaylist(playlistId, track.uri);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const newPlaylist = await createPlaylist(newName.trim());
    if (newPlaylist?.id) {
      await addToPlaylist(newPlaylist.id, track.uri);
    }
    setNewName('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add to Playlist</Text>
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAdd(item.id)}>
                <Text style={styles.item}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No playlists found</Text>}
          />

          <TextInput
            placeholder="New playlist name"
            placeholderTextColor="#aaa"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleCreateAndAdd} disabled={loading}>
            <Text style={styles.button}>{loading ? 'Creating...' : 'Create & Add'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: COLORS.primary, margin: 20, padding: 20, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginBottom: 12 },
  item: { color: COLORS.white, paddingVertical: 8 },
  input: { backgroundColor: '#333', color: COLORS.white, padding: 10, borderRadius: 6, marginTop: 12 },
  button: { color: COLORS.white, textAlign: 'center', marginTop: 10 },
  cancel: { color: '#aaa', textAlign: 'center', marginTop: 10 },
  empty: { color: '#aaa', textAlign: 'center', marginVertical: 12 },
});