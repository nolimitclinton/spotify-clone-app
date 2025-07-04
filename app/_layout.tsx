import { LibraryProvider } from '@/context/libraryContext';
import { PlaylistProvider } from '@/context/playlistContext';
import { SpotifyProvider, useSpotify } from '@/context/spotifyContext';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import LoginScreen from './login';

function LayoutContent() {
  const { user, isLoading } = useSpotify();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Loading user...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Gotham-Bold': require('../assets/fonts/Gotham/Gotham-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/poppins/Poppins-SemiBold.ttf'),
    'DMSans-Regular': require('../assets/fonts/dm-sans/DMSans-Regular.ttf'),
    'DMSans-Bold': require('../assets/fonts/dm-sans/DMSans-Bold.ttf'),
  });

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
      } catch (e) {
        console.warn('Failed to configure audio:', e);
      }
    };
  
    configureAudio();
  }, []);
  
  if (!fontsLoaded) return null;

  return (
    <SpotifyProvider>
      <PlaylistProvider>
      <LibraryProvider>
        <LayoutContent />
        </LibraryProvider>
      </PlaylistProvider>
    </SpotifyProvider>
  );
}