import { useSpotify } from '@/context/spotifyContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { user, isLoading } = useSpotify();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(drawer)');
    }
  }, [isLoading, user]);

  return null;
}