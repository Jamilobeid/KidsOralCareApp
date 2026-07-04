import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

const bubbleToothImage = require('../../assets/images/login-tooth-bubbles-cutout.png');
const bowToothImage = require('../../assets/images/login-tooth-bow-cutout.png');
const signupSparkleToothImage = require('../../assets/images/signup-tooth-sparkle-cutout.png');
const signupBrushToothImage = require('../../assets/images/signup-tooth-brush-cutout.png');

export const AuthScreen = () => {
  const { t, authMode, signInChild, registerChild } = useApp();
  const [username, setUsername] = useState('Sparkle');
  const [password, setPassword] = useState('1234');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState(6);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isSignup = authMode === 'signup';

  React.useEffect(() => {
    if (isSignup) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setAge(4);
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
    }
  }, [isSignup]);

  const validateSignup = () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername.length > 15) {
      Alert.alert('Tiny name check!', 'Keep your sparkle name to 15 characters or less.');
      return;
    }

    if (cleanPassword.length < 4 || cleanPassword.length > 7) {
      Alert.alert('Password sparkle check!', 'Your password should be 4 to 7 characters long.');
      return;
    }

    if (confirmPassword !== password) {
      Alert.alert('Oops, smile twins!', 'Both passwords need to match before we can make your account.');
      return;
    }

    if (age < 4 || age > 12) {
      Alert.alert('Age adventure check!', 'Smile explorers should be ages 4 to 12.');
      return;
    }

    registerChild(cleanUsername, cleanPassword, age);
  };

  if (isSignup) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.signupContent}>
            <View style={styles.signupHeaderRow}>
              <Text style={[headingFont, styles.signupTitle]}>New to us?</Text>
            </View>
            <View style={styles.signupMascots}>
              <Image source={signupSparkleToothImage} style={[styles.signupMascot, styles.signupSparkleMascot]} resizeMode="contain" />
              <Image source={signupBrushToothImage} style={[styles.signupMascot, styles.signupBrushMascot]} resizeMode="contain" />
            </View>
            <Text style={[headingFont, styles.signupSubtitle]}>Create an Account to Discover our{'\n'}Fun Games and Smile stars!</Text>

            <View style={styles.signupPanel}>
              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>Username:</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[bodyFont, styles.signupUnderlineInput]}
                />
              </View>

              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>Password:</Text>
                <View style={styles.signupPasswordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[bodyFont, styles.signupPasswordInput]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    hitSlop={10}
                    style={styles.eyeButton}
                  >
                    <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#41438F" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>Confirm Password:</Text>
                <View style={styles.signupPasswordRow}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[bodyFont, styles.signupPasswordInput]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={confirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
                    onPress={() => setConfirmPasswordVisible((visible) => !visible)}
                    hitSlop={10}
                    style={styles.eyeButton}
                  >
                    <Ionicons name={confirmPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#41438F" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>Enter your age:</Text>
                <View style={styles.agePicker}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease age"
                    onPress={() => setAge((value) => Math.max(4, value - 1))}
                    style={styles.ageButton}
                  >
                    <Ionicons name="remove" size={18} color="#41438F" />
                  </Pressable>
                  <Text style={[headingFont, styles.ageValue]}>{age}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase age"
                    onPress={() => setAge((value) => Math.min(12, value + 1))}
                    style={styles.ageButton}
                  >
                    <Ionicons name="add" size={18} color="#41438F" />
                  </Pressable>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create account"
                onPress={validateSignup}
                style={({ pressed }) => [styles.signupCreateButton, pressed && styles.loginButtonPressed]}
              >
                <Text style={[headingFont, styles.signupCreateButtonText]}>Create Account</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={[headingFont, styles.title]}>{t('enterProgress')}</Text>

          <View style={styles.mascotRow}>
            <Image source={bubbleToothImage} style={[styles.mascot, styles.bubbleMascot]} resizeMode="contain" />
            <Image source={bowToothImage} style={[styles.mascot, styles.bowMascot]} resizeMode="contain" />
          </View>

          <View style={styles.formPanel}>
            <View style={styles.fieldBlock}>
              <Text style={[headingFont, styles.label]}>Username:</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder=""
                style={[bodyFont, styles.underlineInput]}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[headingFont, styles.label]}>Password:</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder=""
                  style={[bodyFont, styles.passwordInput]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={21} color="#41438F" />
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              onPress={() => setRememberMe((checked) => !checked)}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={[bodyFont, styles.rememberText]}>Remember me</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Login"
              onPress={() => signInChild(username, password, rememberMe)}
              style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
            >
              <Text style={[headingFont, styles.loginButtonText]}>Login</Text>
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
    paddingHorizontal: 26,
    paddingTop: 37
  },
  title: {
    color: '#41438F',
    fontSize: 27,
    lineHeight: 35,
    marginBottom: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  mascotRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 58,
    height: 72,
    justifyContent: 'center',
    marginBottom: 0
  },
  mascot: {
    height: 78,
    width: 78
  },
  bubbleMascot: {
    transform: [{ rotate: '-8deg' }]
  },
  bowMascot: {
    marginTop: 2,
    transform: [{ rotate: '7deg' }]
  },
  formPanel: {
    alignSelf: 'stretch',
    backgroundColor: '#F7FBFF',
    borderRadius: 28,
    borderWidth: 0,
    marginTop: 18,
    paddingBottom: 34,
    paddingHorizontal: 32,
    paddingTop: 34,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    width: '100%'
  },
  fieldBlock: {
    marginBottom: 36
  },
  label: {
    color: '#080808',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 13
  },
  underlineInput: {
    borderBottomColor: '#333333',
    borderBottomWidth: 1.5,
    color: '#111111',
    fontSize: 16,
    height: 30,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  passwordRow: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    height: 30
  },
  passwordInput: {
    color: '#111111',
    flex: 1,
    fontSize: 16,
    height: 30,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  eyeButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 32
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    marginTop: -6
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#41438F',
    borderRadius: 4,
    borderWidth: 1.5,
    height: 19,
    justifyContent: 'center',
    width: 19
  },
  checkboxChecked: {
    backgroundColor: '#6155F6'
  },
  rememberText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800'
  },
  loginButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 22,
    height: 45,
    justifyContent: 'center',
    shadowColor: '#1C2754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    width: 260,
    elevation: 3
  },
  loginButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22
  },
  signupContent: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 22
  },
  signupHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    width: '100%'
  },
  signupTitle: {
    color: '#41438F',
    flex: 1,
    fontSize: 52,
    lineHeight: 60,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  signupMascots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 12
  },
  signupMascot: {
    height: 60,
    width: 60
  },
  signupSparkleMascot: {
    transform: [{ rotate: '-12deg' }]
  },
  signupBrushMascot: {
    transform: [{ rotate: '10deg' }]
  },
  signupSubtitle: {
    color: '#17324D',
    fontSize: 25,
    lineHeight: 32,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },
  signupPanel: {
    backgroundColor: '#F7FFFC',
    borderWidth: 0,
    borderRadius: 28,
    shadowColor: '#17324D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
    height: 450,
    paddingHorizontal: 70,
    paddingTop: 29,
    width: '100%', 
    gap: 10
  },
  signupField: {
    marginBottom: 19
  },
  signupLabel: {
    color: '#080808',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 9
  },
  signupUnderlineInput: {
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    color: '#111111',
    fontSize: 16,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  signupPasswordRow: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    flexDirection: 'row',
    height: 28
  },
  signupPasswordInput: {
    color: '#111111',
    flex: 1,
    fontSize: 16,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  agePicker: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    flexDirection: 'row',
    height: 34,
    justifyContent: 'space-between'
  },
  ageButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(97, 85, 246, 0.12)',
    borderColor: '#6155F6',
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 34
  },
  ageValue: {
    color: '#111111',
    fontSize: 20,
    lineHeight: 26
  },
  signupCreateButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 21,
    height: 40,
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#1C2754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    width: 260,
    elevation: 3
  },
  signupCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21
  }
});
