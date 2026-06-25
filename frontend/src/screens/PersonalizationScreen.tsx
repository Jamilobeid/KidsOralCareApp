import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { themes } from '../data/themes';
import { useApp } from '../context/AppContext';
import { ThemeName } from '../types/app';

export const PersonalizationScreen = () => {
  const { t, child, avatarOptions, updateAvatar, updateTheme, theme } = useApp();
  return (
    <Screen>
      <Title>{t('personalization')}</Title>
      <Card>
        <Title size={22}>{t('avatar')}</Title>
        <View style={styles.wrap}>{avatarOptions.map((avatar) => (
          <Pressable key={avatar} onPress={() => updateAvatar(avatar)} style={[styles.avatar, { borderColor: child.avatar === avatar ? theme.primary : '#D8E2EC' }]}>
            <Text style={styles.avatarText}>{avatarGlyph(avatar)}</Text>
          </Pressable>
        ))}</View>
      </Card>
      <Card>
        <Title size={22}>{t('theme')}</Title>
        <View style={styles.wrap}>{(Object.keys(themes) as ThemeName[]).map((name) => (
          <Pressable key={name} onPress={() => updateTheme(name)} style={[styles.swatch, { backgroundColor: themes[name].primary, borderColor: child.theme === name ? '#111827' : 'transparent' }]}>
            <BodyText>{name}</BodyText>
          </Pressable>
        ))}</View>
      </Card>
    </Screen>
  );
};

const avatarGlyph = (avatar: string) => ({ star: '⭐', sun: '☀️', rocket: '🚀', leaf: '🍃', rainbow: '🌈', tooth: '🦷' }[avatar] ?? '⭐');

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatar: { width: 70, height: 70, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  avatarText: { fontSize: 34 },
  swatch: { minWidth: 92, borderRadius: 14, padding: 12, borderWidth: 3, alignItems: 'center' }
});
