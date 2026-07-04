import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { themes } from '../data/themes';
import { toothBuddies } from '../data/toothBuddies';
import { ThemeName } from '../types/app';

export const PersonalizationScreen = () => {
  const { t, child, chooseCharacter, updateTheme, theme } = useApp();

  const handleBuddyPress = (buddy: (typeof toothBuddies)[number], unlocked: boolean) => {
    if (unlocked) {
      chooseCharacter(buddy.id);
      return;
    }
    Alert.alert('Keep leveling up', `${buddy.title} unlocks at Level ${buddy.requiredLevel}.`);
  };

  return (
    <Screen gradientBackground showDecorations={false}>
      <Text style={styles.pageTitle}>{t('personalization')}</Text>
      <Card style={styles.buddySection}>
        <Text style={styles.sectionTitle}>My Tooth Buddy</Text>
        <View style={styles.buddyGrid}>
          {toothBuddies.map((buddy) => {
            const unlocked = child.level >= buddy.requiredLevel;
            const selected = unlocked && child.selectedCharacter === buddy.id;

            return (
              <Pressable key={buddy.id} onPress={() => handleBuddyPress(buddy, unlocked)} style={[styles.buddyCard, !unlocked && styles.buddyCardLocked, selected && { borderColor: theme.primary }]}>
                <View style={[styles.buddyImageWrap, { backgroundColor: buddy.tone }]}>
                  <Image source={buddy.image} style={[styles.buddyImage, !unlocked && styles.lockedBuddyImage]} resizeMode="contain" />
                  {!unlocked ? (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                      <Text style={styles.lockText}>Level {buddy.requiredLevel}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.buddyName, !unlocked && styles.lockedText]}>{buddy.title}</Text>
                {selected ? (
                  <View style={styles.selectedPill}>
                    <Ionicons name="checkmark-circle" size={15} color="#087C72" />
                    <Text style={styles.selectedText}>Active</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Card style={styles.themeSection}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeGrid}>
          {(Object.keys(themes) as ThemeName[]).map((name) => {
            const selected = child.theme === name;

            return (
              <Pressable key={name} onPress={() => updateTheme(name)} style={[styles.swatch, { backgroundColor: themes[name].primary, borderColor: selected ? '#111827' : 'transparent' }]}>
                <View style={styles.swatchContent}>
                  <Text style={styles.themeName}>{name}</Text>
                  {name === 'ocean' ? <Text style={styles.defaultLabel}>Default</Text> : null}
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color="#111827" style={styles.themeCheck} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  buddyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  buddyCard: {
    width: '30.8%',
    minHeight: 142,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: '#F7FFFC',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 15,
    shadowColor: '#17324D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0,height: 5 }, 
    elevation: 10, 
    gap: 15
  },
  pageTitle: {
    color: '#41438F',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    lineHeight: 48,
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
    alignSelf: 'stretch'
  },
  sectionTitle: {
    color: '#17324D',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 8
  },
  buddySection: {
    shadowColor: '#17324D',
    borderWidth: 0,
    borderRadius: 28,
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    padding: 24,
    marginBottom: 20
  },
  themeSection: {
    shadowColor: '#17324D',
    borderWidth: 0,
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 13,
    borderRadius: 28,
    padding: 24,
    textAlign: 'center',
    alignSelf: 'stretch'
  },
  themeName: {
    color: '#000000',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 15,
    lineHeight: 26
  },
  buddyCardLocked: { backgroundColor: '#F8FBFC', borderColor: '#E2EEF2' },
  buddyImageWrap: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  buddyImage: { width: 78, height: 78 },
  lockedBuddyImage: { opacity: 0.35 },
  lockBadge: { position: 'absolute', left: 4, right: 4, bottom: 4, minHeight: 22, borderRadius: 999, backgroundColor: 'rgba(30,54,69,0.82)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  lockText: { color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 9, lineHeight: 12 },
  buddyName: { color: '#41438F', fontFamily: 'Fredoka_700Bold', fontSize: 13, lineHeight: 17, textAlign: 'center' },
  lockedText: { color: '#7A8A96' },
  selectedPill: { minHeight: 24, borderRadius: 999, backgroundColor: '#D9F7F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8 },
  selectedText: { color: '#087C72', fontFamily: 'Fredoka_700Bold', fontSize: 11, lineHeight: 14 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  swatch: { minWidth: 122, minHeight: 72, borderRadius: 20, padding: 12, borderWidth: 0, justifyContent: 'center', shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 7 },
  swatchContent: { gap: 2 },
  defaultLabel: { color: 'rgb(0, 0, 0)', fontFamily: 'Fredoka_700Bold', fontSize: 11, lineHeight: 14, opacity: 0.72 },
  themeCheck: { position: 'absolute', top: 8, right: 8 }
});
