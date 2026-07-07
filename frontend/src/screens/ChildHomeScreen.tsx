import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
import { RootScreen } from '../types/app';
import { bodyFont, headingFont } from '../utils/kidStyle';

const brushTimerImage = require('../../assets/images/home-brush-timer.png');
const starImage = require('../../assets/images/custom-home-star-new.png');
const badgeImage = require('../../assets/images/custom-home-badge.png');
const targetImage = require('../../assets/images/custom-home-target.png');
const smallStarImage = starImage;
const tipAlertImage = require('../../assets/images/custom-home-tip-alert.png');
const tipOneImage = require('../../assets/images/custom-home-one.png');
const tipTwoImage = require('../../assets/images/custom-home-two.png');
const LEVEL_COUNT = 5;
const STARS_PER_LEVEL = 200;

const navTiles: { labelKey: string; target: RootScreen; image: ImageSourcePropType }[] = [
  { labelKey: 'games', target: 'games', image: require('../../assets/images/custom-home-games.png') },
  { labelKey: 'brushing', target: 'brushing', image: require('../../assets/images/custom-home-brush-tile.png') },
  { labelKey: 'leaderboard', target: 'leaderboard', image: require('../../assets/images/custom-home-leaderboard.png') },
  { labelKey: 'personalization', target: 'personalization', image: require('../../assets/images/custom-home-personalization.png') }
];

export const ChildHomeScreen = () => {
  const { child, brushingCountToday, setScreen, theme, t } = useApp();
  const level = Math.min(Math.floor(child.points / STARS_PER_LEVEL) + 1, LEVEL_COUNT);
  const levelStart = (level - 1) * STARS_PER_LEVEL;
  const nextLevelAt = level * STARS_PER_LEVEL;
  const starsIntoLevel = level === LEVEL_COUNT ? STARS_PER_LEVEL : child.points - levelStart;
  const starsToNextLevel = level === LEVEL_COUNT ? 0 : Math.max(nextLevelAt - child.points, 0);
  const levelProgress = level === LEVEL_COUNT ? 1 : Math.min(Math.max(starsIntoLevel / STARS_PER_LEVEL, 0), 1);
  const dailyProgress = Math.min(brushingCountToday, 2);
  const progressPercent = `${(dailyProgress / 2) * 100}%` as `${number}%`;
  const selectedBuddy = toothBuddies.find((buddy) => buddy.id === child.selectedCharacter) ?? toothBuddies[0];

  return (
    <LinearGradient colors={theme.gradient} locations={[0, 0.80, 1]} style={styles.rootGradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.topPills}>
            <View style={styles.topPill}>
              <Text style={[headingFont, styles.topPillText]}>Level {level}</Text>
            </View>
            <View style={styles.topPill}>
              <Text style={[headingFont, styles.topPillText]}>{child.points} Smile Stars</Text>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.levelCard}>
              <View style={[styles.buddyWrap, { backgroundColor: selectedBuddy.tone }]}>
                <Image source={selectedBuddy.image as ImageSourcePropType} style={styles.buddyImage} resizeMode="contain" />
                <View style={styles.levelBadge}><Text style={[headingFont, styles.levelBadgeText]}>{t('levelShort')} {level}</Text></View>
              </View>
              <View style={styles.levelCopy}>
                <Text style={[headingFont, styles.buddyName]}>{selectedBuddy.title}</Text>
                <View style={styles.levelTrack}>
                  <View style={[styles.levelFill, { width: `${levelProgress * 100}%` }]} />
                </View>
                <Text style={[headingFont, styles.levelHint]}>{level === LEVEL_COUNT ? t('maxLevelReached') : t('starsToLevel').replace('{{count}}', `${starsToNextLevel}`).replace('{{level}}', `${level + 1}`)}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={[headingFont, styles.statLabel]}>{t('smileStars')}</Text>
                <Image source={starImage} style={styles.statImage} resizeMode="contain" />
                <Text style={[bodyFont, styles.statValue]}>{child.points}</Text>
              </View>

              <View style={styles.statBlock}>
                <Text style={[headingFont, styles.statLabel]}>{t('badges')}</Text>
                <Image source={badgeImage} style={styles.statImage} resizeMode="contain" />
                <Text style={[bodyFont, styles.statValue]}>{child.badges.length}</Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Brush now"
            onPress={() => setScreen('brushing')}
            style={({ pressed }) => [styles.brushButton, pressed && styles.pressed]}
          >
            <Text style={[headingFont, styles.brushButtonText]}>{t('brushNow')}</Text>
            <View style={styles.brushTimerRow}>
              <Image source={brushTimerImage} style={styles.brushTimerIcon} resizeMode="contain" />
              <Text style={[headingFont, styles.brushTimeText]}>2:00</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Image source={targetImage} style={styles.targetIcon} resizeMode="contain" />
            <Text style={[headingFont, styles.challengeTitle]}>{t('myDailyChallenge')}</Text>
            <View style={styles.rewardPill}>
              <Image source={smallStarImage} style={styles.rewardStar} resizeMode="contain" />
              <Text style={[headingFont, styles.rewardText]}>+20</Text>
            </View>
          </View>
          <Text style={[bodyFont, styles.challengeSubtitle]}>{t('brushTwiceDay')}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressPercent }]} />
          </View>
          <Text style={[headingFont, styles.progressText]}>{dailyProgress}/2</Text>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Image source={tipAlertImage} style={styles.tipAlert} resizeMode="contain" />
            <Text style={[headingFont, styles.tipsTitle]}>{t('hygieneTips')}</Text>
          </View>
          <View style={styles.tipRow}>
            <Image source={tipOneImage} style={styles.tipNumberImage} resizeMode="contain" />
            <Text style={[headingFont, styles.tipText]}>{t('tipBrushCircles')}</Text>
          </View>
          <View style={styles.tipRow}>
            <Image source={tipTwoImage} style={styles.tipNumberImage} resizeMode="contain" />
            <Text style={[headingFont, styles.tipText]}>{t('tipSpit')}</Text>
          </View>
        </View>

        <View style={styles.tileGrid}>
          {navTiles.map((tile) => (
            <Pressable
              key={tile.target}
              accessibilityRole="button"
              accessibilityLabel={t(tile.labelKey)}
              onPress={() => setScreen(tile.target)}
              style={({ pressed }) => [styles.navTile, pressed && styles.pressed]}
            >
              <Image source={tile.image} style={styles.navTileIcon} resizeMode="contain" />
              <Text style={[headingFont, styles.navTileText]}>{t(tile.labelKey)}</Text>
            </Pressable>
          ))}
        </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  rootGradient: {
    flex: 1
  },
  safe: {
    backgroundColor: 'transparent',
    flex: 1
  },
  scrollContent: {
    paddingBottom: 112
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 35,
    paddingHorizontal: 15,
    paddingTop: 7
  },
  topPills: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  topPill: {
    alignItems: 'center',
    backgroundColor: '#25363B',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 16
  },
  topPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18
  },
  progressPanel: {
    backgroundColor: 'rgba(238, 255, 253, 0.93)',
    borderRadius: 28,
    padding: 20,
    width: '92%',
    gap: 14, 
    paddingBottom: 30, 
    borderWidth: 0,
    shadowColor: '#17324D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10
  },
  levelCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    marginBottom: 16
  },
  buddyWrap: {
    alignItems: 'center',
    borderRadius: 24,
    height: 130,
    justifyContent: 'center',
    width: 118
  },
  buddyImage: {
    height: 108,
    width: 108
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    bottom: 6,
    minHeight: 24,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 8
  },
  levelBadgeText: {
    color: '#087C72',
    fontSize: 11,
    lineHeight: 18
  },
  levelCopy: {
    flex: 1,
    gap: 8
  },
  buddyName: {
    color: '#189989',
    fontSize: 34,
    lineHeight: 40
  },
  levelTrack: {
    backgroundColor: '#CFFBF2',
    borderRadius: 999,
    height: 14,
    overflow: 'hidden'
  },
  levelFill: {
    backgroundColor: '#26C8D9',
    borderRadius: 999,
    height: '100%'
  },
  levelHint: {
    color: '#6A8380',
    fontSize: 12,
    lineHeight: 16
  },
  brushButton: {
    alignItems: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 14,
    height: 86,
    justifyContent: 'center',
    marginTop: 40,
    width: 264
  },
  brushButtonText: {
    color: '#1A1A1A',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center'
  },
  brushTimerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 3
  },
  brushTimerIcon: {
    height: 30,
    width: 30
  },
  brushTimeText: {
    color: '#111111',
    fontSize: 17,
    fontFamily: 'Fredoka_700Bold',
    lineHeight: 22
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0
  },
  statBlock: {
    alignItems: 'center',
    backgroundColor: '#F7FFFC',
    borderWidth: 0,
    borderRadius: 28,
    shadowColor: '#17324D',
    flex: 1,
    minHeight: 126,
    paddingVertical: 8, 
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10
  },
  statLabel: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6
  },
  statImage: {
    height: 58,
    marginBottom: 6,
    width: 64
  },
  statValue: {
    color: '#111111',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 27,
    lineHeight: 37
  },
  challengeCard: {
    alignSelf: 'center',
    backgroundColor: '#F7FFFC',
    borderRadius: 15,
    marginTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 10,
    paddingTop: 12,
    width: '92%',
    borderWidth: 0,
    shadowColor: '#17324D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15, 
    gap: 6 
  },
  challengeHeader: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  targetIcon: {
    height: 50,
    width: 50
  },
  challengeTitle: {
    color: '#111111',
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    marginLeft: 10
  },
  rewardPill: {
    alignItems: 'center',
    backgroundColor: '#a29b9b3e',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 3,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  rewardStar: {
    height: 35,
    width: 35
  },
  rewardText: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 23
  },
  challengeSubtitle: {
    color: '#777777',
    fontSize: 18,
    fontFamily: 'Fredoka_700Bold',
    lineHeight: 23,
    marginBottom: 12,
    marginLeft: 80
  },
  progressTrack: {
    alignSelf: 'center',
    backgroundColor: '#D5F3D6',
    borderRadius: 999,
    height: 17,
    overflow: 'hidden',
    width: '91%'
  },
  progressFill: {
    backgroundColor: '#54F160',
    borderRadius: 999,
    height: '100%'
  },
  progressText: {
    color: '#111111',
    fontSize: 19,
    lineHeight: 24,
    textAlign: 'center'
  },
  tipsSection: {
    paddingHorizontal: 24,
    paddingTop: 40
  },
  tipsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15
  },
  tipAlert: {
    height: 49,
    marginRight: 11,
    transform: [{ rotate: '-9deg' }],
    width: 49
  },
  tipsTitle: {
    color: '#111111',
    fontSize: 27,
    lineHeight: 34
  },
  tipRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderColor: '#D7EBF0',
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 54,
    paddingHorizontal: 13
  },
  tipNumberImage: {
    height: 36,
    marginRight: 8,
    width: 36
  },
  tipText: {
    color: '#111111',
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'left'
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 30,
    rowGap: 35,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 40
  },
  navTile: {
    alignItems: 'center',
    backgroundColor: '#fffefe',
    borderRadius: 25,
    height: 122,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 12,
    width: 164,
    borderWidth: 0,
    shadowColor: '#17324D',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 10, height: 10 },
    elevation: 10
  },
  navTileIcon: {
    height: 60,
    width: 60
  },
  navTileText: {
    color: '#111111',
    fontSize: 17,
    lineHeight: 40,
    textAlign: 'center'
  }
});
