import { COLORS } from '@/constants/theme';
import { usePlaylist } from '@/context/playlistContext';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
    console.log('Track passed to addToPlaylist:', track);
    await addToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const newPlaylist = await createPlaylist(newName.trim());
    if (newPlaylist?.id) {
      await addToPlaylist(newPlaylist.id, track);
    }
    setNewName('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Add to Playlist</Text>

              <View style={{ maxHeight: 300 }}>
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.playlistItem} onPress={() => handleAdd(item.id)}>
                      <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/50' }}
                        style={styles.playlistImage}
                      />
                      <Text style={styles.item}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={styles.empty}>No playlists found</Text>}
                />
              </View>

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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    color: COLORS.white,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: COLORS.white,
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 12,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 12,
  },
  cancel: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
  empty: {
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
});