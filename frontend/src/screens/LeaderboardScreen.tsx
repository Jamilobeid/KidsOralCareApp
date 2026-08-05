import React from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { bodyFont, buttonFont, headingFont } from '../utils/kidStyle';

const leaderboardTrophy = require('../../assets/images/leaderboard-trophy.png');
const leaderboardStar = require('../../assets/images/custom-home-star-new.png');
const avatarImages: Record<string, ImageSourcePropType> = {
  star: require('../../assets/images/rewards-buddy-toothy-custom.png'),
  sun: require('../../assets/images/rewards-buddy-tooth-fairy-custom.png'),
  rocket: require('../../assets/images/rewards-buddy-nova-wheel.png'),
  leaf: require('../../assets/images/rewards-buddy-minty-custom.png'),
  rainbow: require('../../assets/images/rewards-buddy-coral-wheel.png'),
  tooth: require('../../assets/images/rewards-buddy-super-tooth-custom.png')
};

const rankColors = ['#FFB703', '#8A9BA8', '#C77C45'];

export const LeaderboardScreen = () => {
  const { t, leaderboard, leaderboardStatus, leaderboardParticipating, refreshLeaderboard, child, theme } = useApp();

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Image source={leaderboardTrophy} style={styles.heroIconImage} resizeMode="contain" />
        </View>
        <Text style={[headingFont, styles.title]}>{t('leaderboard')}</Text>
        <Text style={[bodyFont, styles.subtitle]}>{t('leaderboardPrivacySummary')}</Text>
      </View>

      {leaderboardStatus === 'loading' || leaderboardStatus === 'idle' ? (
        <View style={styles.feedbackCard}>
          <ActivityIndicator size="large" color="#41438F" />
          <Text style={[bodyFont, styles.feedbackText]}>{t('loadingLeaderboard')}</Text>
        </View>
      ) : leaderboardStatus === 'error' ? (
        <View style={styles.feedbackCard}>
          <Text style={[headingFont, styles.feedbackTitle]}>{t('leaderboardUnavailable')}</Text>
          <Text style={[bodyFont, styles.feedbackText]}>{t('leaderboardUnavailableMessage')}</Text>
          <Pressable onPress={refreshLeaderboard} style={styles.retryButton}>
            <Text style={[buttonFont, styles.retryText]}>{t('tryAgain')}</Text>
          </Pressable>
        </View>
      ) : leaderboard.length === 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={[headingFont, styles.feedbackTitle]}>{t('leaderboardEmpty')}</Text>
          <Text style={[bodyFont, styles.feedbackText]}>{t('leaderboardEmptyMessage')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {leaderboard.map((entry, index) => {
            const isCurrentChild = entry.id === child.id;
            const rankColor = rankColors[index] ?? theme.primary;
            return (
              <View key={entry.id} style={[styles.card, isCurrentChild && styles.currentCard]}>
                <View style={[styles.rankBadge, { backgroundColor: `${rankColor}22` }]}>
                  <Text style={[headingFont, styles.rank, { color: rankColor }]}>#{index + 1}</Text>
                </View>
                <View style={[styles.avatarWrap, { backgroundColor: `${theme.primary}18` }]}>
                  <Image source={avatarImages[entry.avatar] ?? avatarImages.tooth} style={styles.avatarImage} resizeMode="contain" />
                </View>
                <View style={styles.copy}>
                  <View style={styles.nameRow}>
                    <Text numberOfLines={1} style={[headingFont, styles.name]}>{entry.nickname}</Text>
                    {isCurrentChild ? <Text style={[buttonFont, styles.youBadge]}>{t('you')}</Text> : null}
                  </View>
                  <Text style={[bodyFont, styles.level]}>{t('level')} {entry.level}</Text>
                </View>
                <View style={styles.pointsWrap}>
                  <Image source={leaderboardStar} style={styles.pointsStar} resizeMode="contain" />
                  <Text style={[headingFont, styles.points]}>{entry.points}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.safetyNote}>
        <Text style={[bodyFont, styles.safetyText]}>{t('leaderboardSafetyNote')}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingTop: 16, paddingBottom: 34 },
  hero: { alignItems: 'center', gap: 8 },
  heroIcon: { alignItems: 'center', backgroundColor: '#FFF4D2', borderRadius: 28, height: 82, justifyContent: 'center', overflow: 'hidden', width: 82 },
  heroIconImage: { height: 68, width: 68 },
  title: { color: '#41438F', fontSize: 38, lineHeight: 45, textAlign: 'center' },
  subtitle: { color: '#455A68', fontSize: 12, lineHeight: 21, maxWidth: 440, textAlign: 'center', fontFamily: 'Fredoka_700Bold' },
  feedbackCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, gap: 10, minHeight: 210, justifyContent: 'center', padding: 24 },
  feedbackTitle: { color: '#41438F', fontSize: 21, lineHeight: 27, textAlign: 'center' },
  feedbackText: { color: '#526A68', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  retryButton: { backgroundColor: '#41438F', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11 },
  retryText: { color: '#FFFFFF', fontSize: 14 },
  list: { gap: 11 },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: 'transparent', borderRadius: 22, borderWidth: 2, elevation: 2, flexDirection: 'row', gap: 11, minHeight: 86, padding: 13, shadowColor: '#17324D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 7 },
  currentCard: { backgroundColor: '#F3FFFC', borderColor: '#80D8C9' },
  rankBadge: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 3, justifyContent: 'center', minHeight: 42, minWidth: 54, paddingHorizontal: 7 },
  rank: { fontSize: 16, lineHeight: 21 },
  avatarWrap: { alignItems: 'center', borderRadius: 18, height: 54, justifyContent: 'center', width: 54 },
  avatarImage: { height: 48, width: 48 },
  copy: { flex: 1, minWidth: 0 },
  nameRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  name: { color: '#17324D', flexShrink: 1, fontSize: 19, lineHeight: 24 },
  youBadge: { backgroundColor: '#DDF8F1', borderRadius: 999, color: '#168F84', fontSize: 10, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 3 },
  level: { color: '#526A68', fontSize: 12, lineHeight: 18 },
  pointsWrap: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  pointsStar: { height: 20, width: 20 },
  points: { color: '#41438F', fontSize: 18, lineHeight: 23 },
  safetyNote: { alignItems: 'flex-start', backgroundColor: '#EEF7F5', borderRadius: 16, flexDirection: 'row', gap: 9, padding: 13 },
  safetyText: { color: '#526A68', flex: 1, fontSize: 11, lineHeight: 17 }
});
