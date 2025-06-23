import CustomDrawerContent from '@/components/CustomDrawerContent';
import { COLORS } from '@/constants/theme';
import { useSpotify } from '@/context/spotifyContext';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  const { user } = useSpotify();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: '70%',
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}