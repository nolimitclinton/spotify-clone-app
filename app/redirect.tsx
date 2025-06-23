// app/redirect.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // Let the layout's useEffect (spotifyContext) handle login state
  }, []);

  return null;
}