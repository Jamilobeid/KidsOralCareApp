import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatPill } from '../components/StatPill';
import { BodyText, Title } from '../components/Typography';
import { ageTips } from '../data/demoData';
import { useApp } from '../context/AppContext';
import { RootScreen } from '../types/app';
import { bodyFont, buttonFont, headingFont, rewardFont } from '../utils/kidStyle';

const toothImage = require('../../assets/images/home-shining-tooth.png');
const smileStarImage = require('../../assets/images/home-smile-star.png');
const hourglassImage = require('../../assets/images/home-hourglass.png');
const checkImage = require('../../assets/images/home-check.png');
const badgeImage = require('../../assets/images/home-badge.png');
const toothbrushImage = require('../../assets/images/home-toothbrush.png');

const tiles: { target: RootScreen; labelKey: string; image: ImageSourcePropType }[] = [
  { target: 'games', labelKey: 'games', image: require('../../assets/images/home-console.png') },
  { target: 'challenges', labelKey: 'challenges', image: require('../../assets/images/home-flag.png') },
  { target: 'leaderboard', labelKey: 'leaderboard', image: require('../../assets/images/home-trophy.png') },
  { target: 'personalization', labelKey: 'personalization', image: require('../../assets/images/home-paint.png') }
];

const tipColors = ['#FFF4C7', '#E7F8F2', '#FFEAF2'];

const AnimatedHeroTooth = () => {
  const float = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(shine, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(shine, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        ])
      ])
    ).start();
  }, [float, shine]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const rotate = float.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });
  const scale = shine.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });

  return (
    <Animated.View style={[styles.heroToothWrap, { transform: [{ translateY }, { rotate }, { scale }] }]}>
      <Image source={toothImage} style={styles.heroTooth} resizeMode="contain" />
    </Animated.View>
  );
};

export const ChildHomeScreen = () => {
  const { t, child, brushingCountToday, setScreen, theme } = useApp();
  const progressImage = brushingCountToday >= 2 ? checkImage : hourglassImage;

  return (
    <Screen>
      <Card style={[styles.heroCard, { backgroundColor: theme.secondary }]}>
        <View style={styles.heroCopy}>
          <Text style={[headingFont, styles.kicker, { color: theme.primary }]}>{t('smileBuddy')}</Text>
          <Title>{t('goodMorning')}</Title>
          <BodyText>{child.nickname} - {t('level')} {child.level}</BodyText>
        </View>
        <AnimatedHeroTooth />
      </Card>

      <View style={styles.stats}>
        <StatPill label={t('smileStars')} value={child.points} imageSource={smileStarImage} />
        <StatPill label={t('todayProgress')} value={`${brushingCountToday}/2`} imageSource={progressImage} />
        <StatPill label={t('badges')} value={child.badges.length} imageSource={badgeImage} />
      </View>

      <Card style={styles.challengeCard}>
        <View style={styles.challengeRow}>
          <View style={styles.challengeIconShell}>
            <Image source={toothbrushImage} style={styles.challengeIcon} resizeMode="contain" />
          </View>
          <View style={styles.challengeCopy}>
            <Title size={22}>{t('dailyChallenge')}</Title>
            <BodyText>{t('challengeText')}</BodyText>
          </View>
        </View>
        <AppButton label={t('brushNow')} onPress={() => setScreen('brushing')} />
      </Card>

      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable key={tile.target} onPress={() => setScreen(tile.target)} style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.secondary }]}>
            <Image source={tile.image} style={styles.tileIcon} resizeMode="contain" />
            <Text style={[buttonFont, styles.tileText, { color: theme.text }]}>{t(tile.labelKey)}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={[styles.tipCard, { backgroundColor: '#F9FDFF' }]}>
        <View style={styles.tipTop}>
          <View style={styles.tipBadge}>
            <Text style={styles.tipBadgeText}>!</Text>
          </View>
          <View style={styles.tipHeadingCopy}>
            <Text style={[headingFont, styles.tipTitle, { color: theme.text }]}>{t('ageContent')} {child.ageGroup}</Text>
            <Text style={[bodyFont, styles.tipSubtitle, { color: theme.text }]}>Tiny habits that make teeth sparkle.</Text>
          </View>
        </View>
        <View style={styles.tipList}>
          {ageTips[child.ageGroup].map((tip, index) => (
            <View key={tip} style={[styles.tipRow, { backgroundColor: tipColors[index % tipColors.length] }]}>
              <View style={[styles.tipNumber, { backgroundColor: theme.primary }]}>
                <Text style={[rewardFont, styles.tipNumberText]}>{index + 1}</Text>
              </View>
              <Text style={[bodyFont, styles.tipText, { color: theme.text }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, overflow: 'hidden' },
  heroCopy: { flex: 1, gap: 4, paddingRight: 4 },
  kicker: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroToothWrap: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  heroTooth: { width: 124, height: 124 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  challengeCard: { gap: 14 },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIconShell: { width: 70, height: 70, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  challengeIcon: { width: 58, height: 58 },
  challengeCopy: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', minHeight: 118, borderRadius: 24, borderWidth: 2, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 7 },
  tileIcon: { width: 64, height: 64 },
  tileText: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  tipCard: { marginBottom: 8, gap: 14, borderColor: '#9BE7F5' },
  tipTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipBadge: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFB703', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  tipBadgeText: { ...rewardFont, color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  tipHeadingCopy: { flex: 1 },
  tipTitle: { fontSize: 22, lineHeight: 28, fontWeight: '900' },
  tipSubtitle: { fontSize: 14, lineHeight: 19, fontWeight: '800', opacity: 0.72 },
  tipList: { gap: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 10 },
  tipNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipNumberText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '800' }
});


