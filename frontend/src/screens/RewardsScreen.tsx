import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
import { rewardFont } from '../utils/kidStyle';

const LEVEL_COUNT = 5;
const STARS_PER_LEVEL = 200;

const badgeDefinitions = [
  { id: 'first-brush', titleKey: 'badgeFirstBrush', image: require('../../assets/images/rewards-badge-first-brush-custom.png'), isNew: false },
  { id: 'three-day-streak', titleKey: 'badgeThreeDay', image: require('../../assets/images/rewards-badge-three-day-custom.png'), isNew: false },
  { id: 'week-warrior', titleKey: 'badgeWeekWarrior', image: require('../../assets/images/rewards-badge-week-warrior-custom.png'), isNew: false },
  { id: 'morning-hero', titleKey: 'badgeMorningHero', image: require('../../assets/images/rewards-badge-morning-hero-custom.png'), isNew: true },
  { id: 'night-owl', titleKey: 'badgeNightOwl', image: require('../../assets/images/rewards-badge-night-owl-custom.png'), isNew: false },
  { id: 'perfect-timer', titleKey: 'badgePerfectTimer', image: require('../../assets/images/rewards-badge-perfect-timer-custom.png'), isNew: false },
  { id: 'cavity-crusher', titleKey: 'badgeCavityCrusher', image: require('../../assets/images/rewards-badge-cavity-crusher-custom.png'), isNew: false },
  { id: 'sparkle-master', titleKey: 'badgeSparkleMaster', image: require('../../assets/images/rewards-badge-sparkle-master-custom.png'), isNew: false }
];

const getProgress = (progress: number, target: number) => Math.min(progress / target, 1);

export const RewardsScreen = () => {
  const { child, theme, brushingCountToday, challenges, chooseCharacter, t } = useApp();

  const level = Math.min(Math.floor(child.points / STARS_PER_LEVEL) + 1, LEVEL_COUNT);
  const weeklyStreak = challenges.find((challenge) => challenge.id === 'weekly-streak');
  const weeklyGames = challenges.find((challenge) => challenge.id === 'weekly-games');
  const dailyBrushes = challenges.find((challenge) => challenge.id === 'daily-two-brushes');

  const unlockedBadges = new Set<string>();
  if (brushingCountToday >= 1 || child.points >= 20) unlockedBadges.add('first-brush');
  if ((weeklyStreak?.progress ?? 0) >= 3) unlockedBadges.add('three-day-streak');
  if ((weeklyStreak?.progress ?? 0) >= 5) unlockedBadges.add('week-warrior');
  if (child.badges.includes('morning-hero') || brushingCountToday >= 1) unlockedBadges.add('morning-hero');
  if (brushingCountToday >= 2) unlockedBadges.add('night-owl');
  if (dailyBrushes && getProgress(dailyBrushes.progress, dailyBrushes.target) >= 1) unlockedBadges.add('perfect-timer');
  if (weeklyGames && getProgress(weeklyGames.progress, weeklyGames.target) >= 1) unlockedBadges.add('cavity-crusher');
  if (level >= LEVEL_COUNT) unlockedBadges.add('sparkle-master');

  const handleBuddyPress = (buddy: (typeof toothBuddies)[number], unlocked: boolean) => {
    if (unlocked) {
      chooseCharacter(buddy.id);
      return;
    }
    Alert.alert(t('keepLeveling'), t('unlocksAtLevel').replace('{{name}}', buddy.title).replace('{{level}}', `${buddy.requiredLevel}`));
  };

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.header}>
        <Text style={[rewardFont, styles.pageTitle]}>{t('rewards')}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('myBadges')}</Text>
        <Text style={styles.sectionMeta}>{unlockedBadges.size} / {badgeDefinitions.length}</Text>
      </View>

      <View style={styles.badgeList}>
        {badgeDefinitions.map((badge) => {
          const unlocked = unlockedBadges.has(badge.id);
          return (
            <View key={badge.id} style={[styles.badgeRow, !unlocked && styles.badgeRowLocked]}>
              <View style={[styles.badgeIcon, !unlocked && styles.lockedIcon]}>
                <Image source={badge.image as ImageSourcePropType} style={[styles.badgeImage, !unlocked && styles.lockedImage]} resizeMode="contain" />
                {!unlocked ? <View style={styles.lockOverlay}><Text style={styles.lockText}>{t('locked')}</Text></View> : null}
              </View>
              <View style={styles.badgeCopy}>
                <Text style={[styles.badgeName, !unlocked && styles.lockedText]}>{t(badge.titleKey)}</Text>
                <Text style={[styles.badgeStatus, !unlocked && styles.lockedText]}>{unlocked ? t('unlocked') : t('keepBrushingUnlock')}</Text>
              </View>
              {unlocked && badge.isNew ? <Text style={styles.newPill}>{t('new')}</Text> : null}
            </View>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('myToothBuddies')}</Text>
        <Text style={styles.sectionMeta}>{t('unlockByLevel')}</Text>
      </View>

      <View style={styles.buddyGrid}>
        {toothBuddies.map((buddy) => {
          const unlocked = level >= buddy.requiredLevel;
          const active = unlocked && child.selectedCharacter === buddy.id;
          return (
            <Pressable key={buddy.id} style={[styles.buddyCard, !unlocked && styles.buddyCardLocked, active && styles.buddyCardActive]} onPress={() => handleBuddyPress(buddy, unlocked)}>
              <View style={[styles.buddyAvatar, { backgroundColor: buddy.tone }]}>
                <Image source={buddy.image as ImageSourcePropType} style={[styles.buddyImage, !unlocked && styles.lockedBuddyImage]} resizeMode="contain" />
                {!unlocked ? <View style={styles.buddyLockOverlay}><Ionicons name="lock-closed" size={14} color="#FFFFFF" /><Text style={styles.lockText}>{t('level').toUpperCase()} {buddy.requiredLevel}</Text></View> : null}
              </View>
              <Text style={styles.buddyName}>{buddy.title}</Text>
              <Text style={styles.buddySubtitle}>{buddy.subtitle}</Text>
              {unlocked ? (
                <View style={[styles.chooseButton, active && styles.activeButton]}>
                  <Text style={[styles.chooseText, active && styles.activeText]}>{active ? t('active') : t('choose')}</Text>
                </View>
              ) : (
                <View style={styles.levelLockButton}>
                  <Ionicons name="lock-closed" size={17} color="#8A6A1D" />
                  <Text style={styles.levelLockText}>{t('chooseLevel').replace('{{level}}', `${buddy.requiredLevel}`)}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 16, paddingBottom: 34 },
  header: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 40, lineHeight: 40, textAlign: 'center', fontFamily: 'Fredoka_700Bold', color: '#41438F' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { color: '#173D3B', fontFamily: 'Fredoka_700Bold', fontSize: 27, lineHeight: 34 },
  sectionMeta: { color: '#6A8380', fontFamily: 'Fredoka_700Bold', fontSize: 16, lineHeight: 24 },
  badgeList: { gap: 12 },
  badgeRow: {
    minHeight: 110,
    borderRadius: 25,
    backgroundColor: 'rgba(244,255,253,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 18,
    shadowColor: '#173D3B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  badgeRowLocked: { backgroundColor: 'rgba(226,250,247,0.82)', opacity: 0.92 },
  badgeIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#173D3B', shadowOpacity: 0.13, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  lockedIcon: { opacity: 0.5 },
  badgeImage: { width: 72, height: 72 },
  lockedImage: { opacity: 0.48 },
  lockOverlay: { position: 'absolute', left: 8, right: 8, bottom: 8, borderRadius: 999, backgroundColor: 'rgba(23,61,59,0.78)', paddingVertical: 2, alignItems: 'center' },
  lockText: { color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 8, lineHeight: 11 },
  badgeCopy: { flex: 1, gap: 4, backgroundColor: 'transparent' },
  badgeName: { color: '#173D3B', fontFamily: 'Fredoka_700Bold', fontSize: 20, lineHeight: 25, backgroundColor: 'transparent' },
  badgeStatus: { color: '#6E8582', fontFamily: 'Fredoka_700Bold', fontSize: 15, lineHeight: 20, backgroundColor: 'transparent' },
  lockedText: { color: '#7A9995', opacity: 0.68 },
  newPill: { overflow: 'hidden', borderRadius: 999, backgroundColor: '#DCF9F3', color: '#087C72', fontFamily: 'Fredoka_700Bold', fontSize: 13, lineHeight: 18, paddingHorizontal: 12, paddingVertical: 8 },
  buddyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  buddyCard: {
    width: '47.8%',
    minHeight: 236,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 8,
    shadowColor: '#173D3B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  buddyCardActive: { borderColor: '#00CDBB' },
  buddyAvatar: { width: 118, height: 118, borderRadius: 59, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  buddyImage: { width: 112, height: 112 },
  buddyCardLocked: { backgroundColor: '#F8FBFC', borderColor: '#E2EEF2' },
  lockedBuddyImage: { opacity: 0.34 },
  buddyLockOverlay: { position: 'absolute', left: 12, right: 12, bottom: 10, minHeight: 26, borderRadius: 999, backgroundColor: 'rgba(30,54,69,0.82)', paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  buddyName: { color: '#173D3B', fontFamily: 'Fredoka_700Bold', fontSize: 19, lineHeight: 24, textAlign: 'center' },
  buddySubtitle: { color: '#6E8582', fontFamily: 'Fredoka_700Bold', fontSize: 14, lineHeight: 19, textAlign: 'center', minHeight: 20 },
  chooseButton: { alignSelf: 'stretch', minHeight: 42, borderRadius: 999, backgroundColor: '#26C8D9', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  activeButton: { backgroundColor: '#D9F7F2' },
  chooseText: { color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 16, lineHeight: 22 },
  activeText: { color: '#087C72' },
  levelLockButton: { alignSelf: 'stretch', minHeight: 42, borderRadius: 999, backgroundColor: '#FFF1C7', borderWidth: 2, borderColor: '#FFE09A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 'auto' },
  levelLockText: { color: '#8A6A1D', fontFamily: 'Fredoka_700Bold', fontSize: 16, lineHeight: 22 }
});
