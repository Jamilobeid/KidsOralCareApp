import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { BouncyTooth } from '../components/AnimatedMascots';
import { bodyFont } from '../utils/kidStyle';

export const AuthScreen = () => {
  const { t, theme, signInChild, registerChild } = useApp();
  const [username, setUsername] = useState('Sparkle');
  const [password, setPassword] = useState('1234');

  return (
    <Screen>
      <View style={styles.hero}>
        <BouncyTooth size={108} />
        <Title>{t('enterProgress')}</Title>
      </View>
      <Card style={styles.card}>
        <Text style={[styles.label, { color: theme.text }]}>{t('username')}</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder={t('usernamePlaceholder')}
          autoCapitalize="none"
          style={[styles.input, { borderColor: theme.secondary, color: theme.text }]}
        />
        <Text style={[styles.label, { color: theme.text }]}>{t('password')}</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('passwordPlaceholder')}
          secureTextEntry
          style={[styles.input, { borderColor: theme.secondary, color: theme.text }]}
        />
        <AppButton label={t('signIn')} onPress={() => signInChild(username, password)} />
        <AppButton label={t('createChildAccount')} onPress={() => registerChild(username, password)} variant="secondary" />
      </Card>
      <Image source={require('../../assets/images/super-tooth.png')} style={styles.superTooth} resizeMode="contain" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  card: { gap: 12 },
  superTooth: { alignSelf: 'center', width: 170, height: 150, marginTop: 16 },
  label: { ...bodyFont, fontSize: 15, fontWeight: '900' },
  input: {
    minHeight: 54,
    borderWidth: 2,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '900',
    ...bodyFont
  }
});


