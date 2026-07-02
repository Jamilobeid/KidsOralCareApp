import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { RootScreen } from '../types/app';
import { bodyFont, headingFont } from '../utils/kidStyle';

const heroToothImage = require('../../assets/images/custom-home-super-tooth.png');
const brushTimerImage = require('../../assets/images/home-brush-timer.png');
const starImage = require('../../assets/images/custom-home-star-new.png');
const badgeImage = require('../../assets/images/custom-home-badge.png');
const targetImage = require('../../assets/images/custom-home-target.png');
const smallStarImage = starImage;
const tipAlertImage = require('../../assets/images/custom-home-tip-alert.png');
const tipOneImage = require('../../assets/images/custom-home-one.png');
const tipTwoImage = require('../../assets/images/custom-home-two.png');

const navTiles: { label: string; target: RootScreen; image: ImageSourcePropType; tooth: ImageSourcePropType; raised?: boolean; toothTilt: string }[] = [
  { label: 'Games', target: 'games', image: require('../../assets/images/custom-home-games.png'), tooth: require('../../assets/images/custom-home-tile-tooth-games.png'), toothTilt: '-8deg' },
  { label: 'Challenges', target: 'challenges', image: require('../../assets/images/custom-home-challenges.png'), tooth: require('../../assets/images/custom-home-tile-tooth-challenges.png'), raised: true, toothTilt: '9deg' },
  { label: 'Leaderboard', target: 'leaderboard', image: require('../../assets/images/custom-home-leaderboard.png'), tooth: require('../../assets/images/custom-home-tile-tooth-leaderboard.png'), toothTilt: '-10deg' },
  { label: 'Personalization', target: 'personalization', image: require('../../assets/images/custom-home-personalization.png'), tooth: require('../../assets/images/custom-home-tile-tooth-personalization.png'), raised: true, toothTilt: '8deg' }
];

export const ChildHomeScreen = () => {
  const { child, brushingCountToday, setScreen } = useApp();
  const dailyProgress = Math.min(brushingCountToday, 2);
  const progressPercent = `${Math.max(8, (dailyProgress / 2) * 100)}%` as `${number}%`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.72, 1]} style={styles.heroGradient}>
          <View pointerEvents="none" style={[styles.cornerLine, styles.cornerLineLeft]} />
          <View pointerEvents="none" style={[styles.cornerLine, styles.cornerLineRight]} />

          <Text style={[headingFont, styles.welcomeText]}>Welcome {child.nickname}</Text>
          <Image source={heroToothImage} style={styles.heroTooth} resizeMode="contain" />

          <View style={styles.questionBlock}>
            <Text style={[bodyFont, styles.questionText]}>Do You Want Your Teeth</Text>
            <View style={styles.questionSecondLine}>
              <Text style={styles.decorativeT}>T</Text>
              <Text style={[bodyFont, styles.questionText]}>o Look Like This?</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Brush now"
            onPress={() => setScreen('brushing')}
            style={({ pressed }) => [styles.brushButton, pressed && styles.pressed]}
          >
            <Text style={[headingFont, styles.brushButtonText]}>Brush Now</Text>
            <View style={styles.brushTimerRow}>
              <Image source={brushTimerImage} style={styles.brushTimerIcon} resizeMode="contain" />
              <Text style={[headingFont, styles.brushTimeText]}>2:00</Text>
            </View>
          </Pressable>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={[headingFont, styles.statLabel]}>Smile Stars</Text>
            <Image source={starImage} style={styles.statImage} resizeMode="contain" />
            <Text style={[bodyFont, styles.statValue]}>{child.points}</Text>
          </View>

          <View style={styles.statsDivider} />

          <View style={styles.statBlock}>
            <Text style={[headingFont, styles.statLabel]}>Badges</Text>
            <Image source={badgeImage} style={styles.statImage} resizeMode="contain" />
            <Text style={[bodyFont, styles.statValue]}>{child.badges.length}</Text>
          </View>
        </View>

        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Image source={targetImage} style={styles.targetIcon} resizeMode="contain" />
            <Text style={[headingFont, styles.challengeTitle]}>My Daily Challenge</Text>
            <View style={styles.rewardPill}>
              <Image source={smallStarImage} style={styles.rewardStar} resizeMode="contain" />
              <Text style={[headingFont, styles.rewardText]}>+20</Text>
            </View>
          </View>
          <Text style={[bodyFont, styles.challengeSubtitle]}>Brush Twice a Day</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressPercent }]} />
          </View>
          <Text style={[headingFont, styles.progressText]}>{dailyProgress}/2</Text>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Image source={tipAlertImage} style={styles.tipAlert} resizeMode="contain" />
            <Text style={[headingFont, styles.tipsTitle]}>Hygiene Tips:</Text>
          </View>
          <View style={styles.tipRow}>
            <Image source={tipOneImage} style={styles.tipNumberImage} resizeMode="contain" />
            <Text style={[headingFont, styles.tipText]}>Brush Circles on Each Tooth Zone</Text>
          </View>
          <View style={styles.tipRow}>
            <Image source={tipTwoImage} style={styles.tipNumberImage} resizeMode="contain" />
            <Text style={[headingFont, styles.tipText]}>Spit After Brushing and Avoid{'\n'}Rinsing Too Much</Text>
          </View>
        </View>

        <View style={styles.tileGrid}>
          {navTiles.map((tile) => (
            <Pressable
              key={tile.target}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              onPress={() => setScreen(tile.target)}
              style={({ pressed }) => [styles.navTile, tile.raised && styles.navTileRaised, pressed && styles.pressed]}
            >
              <Image source={tile.image} style={styles.navTileIcon} resizeMode="contain" />
              <Text style={[headingFont, styles.navTileText]}>{tile.label}</Text>
              <Image source={tile.tooth} style={[styles.navTileTooth, { transform: [{ rotate: tile.toothTilt }] }]} resizeMode="contain" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  scrollContent: {
    paddingBottom: 112
  },
  heroGradient: {
    alignItems: 'center',
    paddingBottom: 38,
    paddingHorizontal: 12,
    paddingTop: 16
  },
  cornerLine: {
    backgroundColor: '#111111',
    height: 1.2,
    position: 'absolute',
    top: 9,
    width: 105
  },
  cornerLineLeft: {
    left: -20,
    transform: [{ rotate: '-38deg' }]
  },
  cornerLineRight: {
    right: -20,
    transform: [{ rotate: '38deg' }]
  },
  welcomeText: {
    color: '#41438F',
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 9,
    textAlign: 'center'
  },
  heroTooth: {
    height: 188,
    marginBottom: 12,
    width: 238
  },
  questionBlock: {
    alignSelf: 'stretch',
    marginBottom: 15
  },
  questionText: {
    color: '#111111',
    fontFamily: 'serif',
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'left'
  },
  questionSecondLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 42
  },
  decorativeT: {
    color: '#111111',
    fontFamily: 'serif',
    fontSize: 62,
    fontStyle: 'italic',
    lineHeight: 60,
    marginRight: 0
  },
  brushButton: {
    alignItems: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 14,
    height: 86,
    justifyContent: 'center',
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
    height: 24,
    width: 24
  },
  brushTimeText: {
    color: '#111111',
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 22
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingTop: 12
  },
  statBlock: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6
  },
  statImage: {
    height: 84,
    marginBottom: 6,
    width: 92
  },
  statValue: {
    color: '#111111',
    fontFamily: 'serif',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37
  },
  statsDivider: {
    backgroundColor: '#333333',
    height: 145,
    marginHorizontal: 20,
    width: 1
  },
  challengeCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(226, 237, 236, 0.86)',
    borderRadius: 15,
    marginTop: 42,
    paddingBottom: 14,
    paddingHorizontal: 33,
    paddingTop: 15,
    width: '92%'
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
    marginLeft: 9
  },
  rewardPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    fontWeight: '800',
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
    paddingTop: 50
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
    columnGap: 12,
    rowGap: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 44
  },
  navTile: {
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 16,
    height: 222,
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 25,
    width: 164
  },
  navTileRaised: {
    marginTop: 58
  },
  navTileIcon: {
    height: 66,
    width: 66
  },
  navTileText: {
    color: '#111111',
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center'
  },
  navTileTooth: {
    height: 74,
    width: 84
  }
});
