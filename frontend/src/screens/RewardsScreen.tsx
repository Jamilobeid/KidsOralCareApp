import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { AnimatedStatIcon } from '../components/AnimatedMascots';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { rewardFont } from '../utils/kidStyle';

const badgeLabels: Record<string, string> = {
  'morning-hero': 'Morning Hero',
  'seven-day-smile': 'Seven-day Smile',
  'food-detective': 'Food Detective'
};

const badgeImages: Record<string, ImageSourcePropType> = {
  'morning-hero': require('../../assets/images/rewards-badge-morning-edge-cutout.png'),
  'seven-day-smile': require('../../assets/images/rewards-badge-seven-day.png'),
  'food-detective': require('../../assets/images/rewards-badge-food.png')
};

const levelImages: Record<number, ImageSourcePropType> = {
  1: require('../../assets/images/rewards-level-1-cutout.png'),
  2: require('../../assets/images/rewards-level-2-cutout.png'),
  3: require('../../assets/images/rewards-level-3-cutout.png'),
  4: require('../../assets/images/rewards-level-4-cutout.png'),
  5: require('../../assets/images/rewards-level-5-cutout.png')
};

const prettyBadge = (badge: string) => badgeLabels[badge] ?? badge.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const getLevelImage = (level: number) => levelImages[Math.min(Math.max(level, 1), 5)];
const getBadgeImage = (badge: string) => badgeImages[badge] ?? require('../../assets/images/rewards-badge-shield.png');

export const RewardsScreen = () => {
  const { t, child, theme } = useApp();
  const nextLevelPoints = Math.max(0, child.level * 200 - child.points);

  return (
    <Screen contentContainerStyle={styles.screen}>
      <Title size={38}>{t('rewards')}</Title>

      <View style={styles.rewardStrip}>
        <Image source={require('../../assets/images/rewards-smiling-star-cutout.png')} style={styles.starImage} resizeMode="contain" />
        <View style={styles.stripTextWrap}>
          <Text style={[rewardFont, styles.stripValue]}>{child.points}</Text>
          <Text style={[rewardFont, styles.stripLabel]}>MY Smile Stars</Text>
        </View>
      </View>

      <View style={[styles.rewardStrip, styles.levelStrip]}>
        <Image source={getLevelImage(child.level)} style={styles.levelImage} resizeMode="contain" />
        <View style={styles.stripTextWrap}>
          <Text style={[rewardFont, styles.stripValue]}>Level {child.level}</Text>
          <Text style={[rewardFont, styles.stripLabel, styles.stripSubLabel]}>{nextLevelPoints === 0 ? 'Next Level Is Ready!' : `${nextLevelPoints} Stars to the Next Level`}</Text>
        </View>
      </View>

      <Card style={styles.badgesCard}>
        <View style={styles.badgeHeader}>
          <View style={styles.badgeTitleWrap}>
            <Title size={28}>{t('badges')}</Title>
            <Image source={require('../../assets/images/rewards-badge-shield.png')} style={styles.headerMedal} resizeMode="contain" />
          </View>
          <Text style={[rewardFont, styles.badgeCount, { color: theme.text }]}>{child.badges.length}/8</Text>
        </View>

        {child.badges.map((badge) => (
          <View key={badge} style={styles.badgeRow}>
            <View style={styles.badgeIconTile}>
              <Image source={getBadgeImage(badge)} style={styles.rowMedal} resizeMode="contain" />
            </View>
            <Text style={[rewardFont, styles.badgeText, { color: theme.text }]}>{prettyBadge(badge)}</Text>
            <AnimatedStatIcon type="check" />
          </View>
        ))}
      </Card>

      <Card style={styles.unlockedCard}>
        <Title size={22}>{t('unlocked')}</Title>
        <View style={styles.unlockedList}>
          {child.unlockedCharacters.map((name) => <BodyText key={name}>- {name}</BodyText>)}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingBottom: 28 },
  rewardStrip: {
    minHeight: 112,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#FFC84D',
    shadowColor: '#C78000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5
  },
  levelStrip: {
    backgroundColor: '#76D4F4',
    shadowColor: '#189AD6'
  },
  stripTextWrap: { flex: 1, justifyContent: 'center' },
  stripValue: { color: '#FFFFFF', fontSize: 38, lineHeight: 43, fontWeight: '900' },
  stripLabel: { color: '#FFFFFF', fontSize: 18, lineHeight: 23, fontWeight: '900' },
  stripSubLabel: { fontStyle: 'italic' },
  starImage: { width: 86, height: 78 },
  levelImage: { width: 88, height: 88 },
  badgesCard: { gap: 14, paddingVertical: 20 },
  badgeHeader: { marginBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeCount: { fontSize: 17, fontWeight: '900', opacity: 0.55 },
  headerMedal: { width: 54, height: 54 },
  badgeRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#76D8E8'
  },
  badgeIconTile: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  rowMedal: { width: 58, height: 58 },
  badgeText: { flex: 1, fontSize: 21, fontWeight: '900' },
  unlockedCard: { gap: 8 },
  unlockedList: { gap: 4 }
});


