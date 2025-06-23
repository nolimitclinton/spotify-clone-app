// app/login.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../constants/images';
import { COLORS, FONTS } from '../constants/theme';
import { useSpotify } from '../context/spotifyContext';

export default function LoginScreen() {
  const { login } = useSpotify();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={IMAGES.logo} style={styles.logo} />

      <Text style={styles.subtitle}>Millions of songs</Text>
      <Text style={styles.description}>Free on Spotify.</Text>

      <TouchableOpacity style={styles.signupButton}>
        <Text style={styles.signupText}>Sign up free</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginOption}>
        <Image source={IMAGES.phone} style={styles.iconImage} />
        <Text style={styles.optionText}>Continue with phone number</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginOption}>
        <Image source={IMAGES.googleicon} style={styles.iconImage} />
        <Text style={styles.optionText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginOption}>
        <Image source={IMAGES.facebookicon} style={styles.iconImage} />
        <Text style={styles.optionText}>Continue with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  logo: { width: 100, height: 100, marginBottom: 40 },
  signupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: '100%',
  },
  signupText: {
    color: COLORS.background,
    fontSize: 21,
    fontFamily: FONTS.poppinsSemiBold,
    textAlign: 'center',
  },
  loginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 50,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  optionText: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.poppinsSemiBold,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 32,
    fontFamily: FONTS.gothamBold,
    marginBottom: 4,
  },
  description: {
    color: COLORS.white,
    fontSize: 32,
    fontFamily: FONTS.gothamBold,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 21,
    fontFamily: FONTS.poppinsSemiBold,
  },
});