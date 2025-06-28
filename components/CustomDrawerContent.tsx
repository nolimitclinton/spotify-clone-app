import { IMAGES } from '@/constants/images';
import { COLORS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { user, logout } = useSpotify();

  return (
    <View style={styles.container}>
      <Image
        source={user?.images?.[0]?.url ? { uri: user.images[0].url } : IMAGES.defaultAvatar}
        style={styles.avatar}
      />
      <Text style={styles.username}>Hi {user?.display_name || 'Guest'}</Text>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Ionicons name="log-out" size={24} color={COLORS.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeDrawer} onPress={() => navigation.closeDrawer()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        <Text style={styles.logoutText}>Close Drawer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.surface },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
  username: { color: COLORS.white, fontSize: 18, marginBottom: 30 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.white,
    marginLeft: 10,
    fontSize: 16,
  },
});