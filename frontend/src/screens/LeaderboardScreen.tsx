import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
import { bodyFont, headingFont } from '../utils/kidStyle';

export const LeaderboardScreen = () => {
  const { t, leaderboard, child, theme } = useApp();
  const selectedBuddy = toothBuddies.find((buddy) => buddy.id === child.selectedCharacter) ?? toothBuddies[0];
  const buddyByRank = [toothBuddies[7], selectedBuddy, toothBuddies[4], toothBuddies[5]];

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <Text style={[headingFont, styles.title]}>{t('leaderboard')}</Text>
      <Text style={[bodyFont, styles.subtitle]}>{t('childSafeRank')}</Text>

      {leaderboard.map((entry, index) => {
        const buddy = buddyByRank[index] ?? toothBuddies[index % toothBuddies.length];

        return (
          <View key={entry.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={[headingFont, styles.rank, { color: theme.primary }]}>#{index + 1}</Text>
              <View style={[styles.avatarWrap, { backgroundColor: buddy.tone }]}>
                <Image source={buddy.image as ImageSourcePropType} style={styles.avatar} resizeMode="contain" />
              </View>
              <View style={styles.copy}>
                <Text style={[headingFont, styles.name]}>{entry.nickname}</Text>
                <Text style={[bodyFont, styles.level]}>{t('level')} {entry.level}</Text>
              </View>
              <Text style={[headingFont, styles.points, { color: theme.primary }]}>{entry.points}</Text>
            </View>
          </View>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingTop: 18 },
  title: {
    color: '#41438F',
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center'
  },
  subtitle: {
    color: '#17324D',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Fredoka_700Bold'
  },
  card: {
    backgroundColor: '#F7FFFC',
    shadowColor: '#17324D',
    borderRadius: 28,
    borderWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    elevation: 10
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  rank: { fontSize: 24, lineHeight: 30, width: 46 },
  avatarWrap: {
    alignItems: 'center',
    borderRadius: 20,
    height: 58,
    justifyContent: 'center',
    width: 58
  },
  avatar: { height: 62, width: 62 },
  copy: { flex: 1 },
  name: { color: '#17324D', fontSize: 24, lineHeight: 30 },
  level: { color: '#17324D', fontSize: 13.5, lineHeight: 20, fontFamily: 'Fredoka_700Bold' },
  points: { fontSize: 24, lineHeight: 30 }
});
