import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { AuthMode } from '../types/app';
import { bodyFont, headingFont } from '../utils/kidStyle';

const welcomeToothImage = require('../../assets/images/welcome-tooth-cutout.png');

export const WelcomeScreen = () => {
  const { setAuthMode, setScreen } = useApp();

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setScreen('auth');
  };

  return (
    <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={[headingFont, styles.title]}>Welcome!</Text>
          <Image accessibilityLabel="Smiling clean tooth" source={welcomeToothImage} style={styles.tooth} resizeMode="contain" />
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create account"
              onPress={() => openAuth('signup')}
              style={({ pressed }) => [styles.button, styles.createButton, pressed && styles.buttonPressed]}
            >
              <Text style={[bodyFont, styles.createButtonText]}>Create Account</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Login"
              onPress={() => openAuth('login')}
              style={({ pressed }) => [styles.button, styles.loginButton, pressed && styles.buttonPressed]}
            >
              <Text style={[bodyFont, styles.loginButtonText]}>Login</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 84
  },
  title: {
    color: '#41438F',
    fontSize: 51,
    lineHeight: 58,
    marginBottom: 12,
    textAlign: 'center'
  },
  tooth: {
    height: 190,
    marginBottom: 58,
    width: 190
  },
  actions: {
    alignItems: 'center',
    gap: 23,
    width: '100%'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C2754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  createButton: {
    backgroundColor: '#6155F6',
    borderRadius: 24,
    height: 48,
    width: 206
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 9,
    height: 39,
    width: 128
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22
  }
});
