import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { toothBuddies } from '../data/toothBuddies';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

type RaceAsset = { image: ImageSourcePropType; healthy: boolean };
type RaceItem = { assetIndex: number; id: number; lane: number; y: number };
type RaceStatus = 'ready' | 'running' | 'finished';

const TICK_MS = 80;
const ARENA_HEIGHT = 470;
const PLAYER_Y = ARENA_HEIGHT - 94;
const ITEM_REMOVAL_Y = ARENA_HEIGHT - 10;
const raceBackgroundA = require('../../assets/images/smile-race-background-a.png');
const raceBackgroundB = require('../../assets/images/smile-race-background-b.png');
const getSmileStarReward = (score: number) => {
  if (score >= 35) return 20;
  if (score >= 20) return 15;
  if (score >= 10) return 10;
  if (score >= 5) return 5;
  return 0;
};
const raceAssets: RaceAsset[] = [
  { image: require('../../assets/images/smile-race-healthy-01.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-02.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-03.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-04.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-05.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-06.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-07.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-08.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-09.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-10.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-11.png'), healthy: true },
  { image: require('../../assets/images/smile-race-healthy-12.png'), healthy: true },
  { image: require('../../assets/images/smile-race-unhealthy-13.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-14.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-15.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-16.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-17.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-18.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-19.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-20.png'), healthy: false },
  { image: require('../../assets/images/smile-race-unhealthy-21.png'), healthy: false }
];
const healthyAssetIndexes = raceAssets.flatMap((asset, index) => asset.healthy ? [index] : []);
const unhealthyAssetIndexes = raceAssets.flatMap((asset, index) => asset.healthy ? [] : [index]);

export const SmileRaceGame = ({ canPlayAgain, onComplete, onReplay, onStart }: { canPlayAgain: boolean; onComplete: (smileStars: number, score: number) => void; onReplay: () => boolean; onStart: () => boolean }) => {
  const { child, t } = useApp();
  const buddy = toothBuddies.find((item) => item.id === child.selectedCharacter) ?? toothBuddies[0];
  const [status, setStatus] = useState<RaceStatus>('ready');
  const [lane, setLane] = useState(1);
  const [jumping, setJumping] = useState(false);
  const [items, setItems] = useState<RaceItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const laneRef = useRef(1);
  const jumpingRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const spawnElapsedRef = useRef(0);
  const nextIdRef = useRef(1);
  const awardedRef = useRef(false);
  const arenaWidthRef = useRef(1);
  const gestureStartLaneRef = useRef(1);
  const statusRef = useRef<RaceStatus>('ready');
  const backgroundProgress = useRef(new Animated.Value(0)).current;

  const resetRace = () => {
    if (statusRef.current === 'ready' && !onStart()) return;
    laneRef.current = 1;
    jumpingRef.current = false;
    scoreRef.current = 0;
    livesRef.current = 3;
    spawnElapsedRef.current = 0;
    awardedRef.current = false;
    setLane(1);
    setJumping(false);
    setItems([]);
    setScore(0);
    setLives(3);
    setStatus('running');
  };

  useEffect(() => {
    if (status !== 'running') return;
    const timer = setInterval(() => {
      spawnElapsedRef.current += TICK_MS;
      const difficultyLevel = Math.min(10, scoreRef.current);
      const speed = 5.65 + difficultyLevel * 0.85;
      const spawnEvery = Math.max(260, 900 - difficultyLevel * 55);
      setItems((current) => {
        const next: RaceItem[] = [];
        current.forEach((item) => {
          const moved = { ...item, y: item.y + speed };
          const reachedPlayer = item.y < PLAYER_Y && moved.y >= PLAYER_Y;
          if (reachedPlayer && moved.lane === laneRef.current) {
            if (raceAssets[moved.assetIndex].healthy) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
            } else if (!jumpingRef.current) {
              livesRef.current = Math.max(0, livesRef.current - 1);
              setLives(livesRef.current);
            }
            return;
          }
          if (moved.y < ITEM_REMOVAL_Y) next.push(moved);
        });

        if (spawnElapsedRef.current >= spawnEvery) {
          spawnElapsedRef.current = 0;
          const obstacleChance = Math.min(0.78, 0.38 + difficultyLevel * 0.04);
          const pool = Math.random() < obstacleChance ? unhealthyAssetIndexes : healthyAssetIndexes;
          next.push({
            assetIndex: pool[Math.floor(Math.random() * pool.length)],
            id: nextIdRef.current++,
            lane: Math.floor(Math.random() * 3),
            y: -48
          });
        }
        return next;
      });

      if (livesRef.current <= 0) {
        if (!awardedRef.current) {
          awardedRef.current = true;
          onComplete(getSmileStarReward(scoreRef.current), scoreRef.current);
        }
        setStatus('finished');
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [onComplete, status]);

  useEffect(() => {
    if (status !== 'running') {
      backgroundProgress.stopAnimation();
      backgroundProgress.setValue(0);
      return;
    }

    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundProgress, { toValue: 1, duration: 4200, useNativeDriver: true }),
        Animated.timing(backgroundProgress, { toValue: 0, duration: 4200, useNativeDriver: true })
      ])
    );
    backgroundAnimation.start();
    return () => backgroundAnimation.stop();
  }, [backgroundProgress, status]);

  const jump = () => {
    if (statusRef.current !== 'running' || jumpingRef.current) return;
    jumpingRef.current = true;
    setJumping(true);
    setTimeout(() => {
      jumpingRef.current = false;
      setJumping(false);
    }, 650);
  };

  statusRef.current = status;
  const raceGestures = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => statusRef.current === 'running',
    onMoveShouldSetPanResponder: () => statusRef.current === 'running',
    onPanResponderGrant: () => {
      gestureStartLaneRef.current = laneRef.current;
    },
    onPanResponderMove: (_event, gesture) => {
      const laneWidth = Math.max(1, arenaWidthRef.current / 3);
      const laneOffset = Math.round(gesture.dx / laneWidth);
      const nextLane = Math.max(0, Math.min(2, gestureStartLaneRef.current + laneOffset));
      if (nextLane === laneRef.current) return;
      laneRef.current = nextLane;
      setLane(nextLane);
    },
    onPanResponderRelease: (_event, gesture) => {
      if (Math.abs(gesture.dx) < 8 && Math.abs(gesture.dy) < 8) jump();
    },
    onPanResponderTerminate: () => undefined
  })).current;

  const replay = () => {
    if (!canPlayAgain || !onReplay()) return;
    resetRace();
  };

  if (status === 'ready') {
    return (
      <Card style={styles.introCard}>
        <View style={styles.buddyPreview}><Image source={buddy.image} style={styles.previewImage} resizeMode="contain" /></View>
        <Text style={[headingFont, styles.introTitle]}>{t('raceReady')}</Text>
        <Text style={[bodyFont, styles.introText]}>{t('raceInstructions')}</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendPill}><Ionicons name="sparkles" size={18} color="#129B65" /><Text style={styles.legendGood}>{t('collect')}</Text></View>
          <View style={styles.legendPill}><Ionicons name="warning" size={18} color="#D94B6A" /><Text style={styles.legendBad}>{t('avoid')}</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={resetRace} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>{t('startRace')}</Text></Pressable>
      </Card>
    );
  }

  if (status === 'finished') {
    const smileStars = getSmileStarReward(score);
    return (
      <Card style={styles.resultCard}>
        <Text style={styles.resultEmoji}>🏆</Text>
        <Text style={[headingFont, styles.resultTitle]}>{t('greatRacing')}</Text>
        <Text style={[bodyFont, styles.resultText]}>{t('raceResult').replace('{{name}}', buddy.title).replace('{{score}}', `${score}`)}</Text>
        <View style={styles.scorePill}><Text style={[headingFont, styles.scorePillText]}>{t('score')}: {score}</Text></View>
        {smileStars > 0 ? <Text style={[headingFont, styles.rewardText]}>+{smileStars} {t('smileStars')}</Text> : null}
        {canPlayAgain ? <Pressable accessibilityRole="button" onPress={replay} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>{t('raceAgain')}</Text></Pressable> : <Text style={[bodyFont, styles.noTriesText]}>{t('racesFinishedToday')}</Text>}
      </Card>
    );
  }

  return (
    <View style={styles.gameWrap}>
      <View style={styles.hudRow}>
        <View style={styles.hudPill}><Ionicons name="star" size={18} color="#F7B500" /><Text style={styles.hudText}>{score}</Text></View>
        <View style={styles.hudPill}><Ionicons name="speedometer" size={18} color="#6552EB" /><Text style={styles.hudText}>{t('speed')} {Math.min(11, 1 + score)}</Text></View>
        <View style={styles.hudPill}><Text style={styles.hearts}>{'❤️'.repeat(lives)}</Text></View>
      </View>
      <View
        {...raceGestures.panHandlers}
        accessibilityLabel={t('raceTrackAccessibility')}
        onLayout={(event) => { arenaWidthRef.current = event.nativeEvent.layout.width; }}
        style={styles.arena}
      >
        <Animated.Image
          resizeMode="cover"
          source={raceBackgroundA}
          style={[
            styles.raceBackground,
            {
              opacity: backgroundProgress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 0.82, 0.2] }),
              transform: [
                { scale: backgroundProgress.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.1] }) },
                { translateY: backgroundProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }) }
              ]
            }
          ]}
        />
        <Animated.Image
          resizeMode="cover"
          source={raceBackgroundB}
          style={[
            styles.raceBackground,
            {
              opacity: backgroundProgress.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0.12, 0.35, 1] }),
              transform: [
                { scale: backgroundProgress.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1.02] }) },
                { translateY: backgroundProgress.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }
              ]
            }
          ]}
        />
        <View pointerEvents="none" style={styles.backgroundShade} />
        {[0, 1, 2].map((trackLane) => <View key={trackLane} style={styles.lane} />)}
        {items.map((item) => (
          <Image key={item.id} source={raceAssets[item.assetIndex].image} style={[styles.raceItem, { left: `${item.lane * 33.333 + 8}%` as `${number}%`, top: item.y }]} resizeMode="contain" />
        ))}
        <View style={[styles.player, { left: `${lane * 33.333 + 5.5}%` as `${number}%`, transform: [{ translateY: jumping ? -74 : 0 }, { rotate: jumping ? '-8deg' : '0deg' }] }]}>
          <Image source={buddy.image} style={styles.playerImage} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.touchHint}>
        <View style={styles.touchHintItem}><Ionicons name="hand-left" size={22} color="#6552EB" /><Text style={[headingFont, styles.touchHintText]}>{t('dragToMove')}</Text></View>
        <View style={styles.touchHintItem}><Ionicons name="finger-print" size={22} color="#35A99A" /><Text style={[headingFont, styles.touchHintText]}>{t('tapToJump')}</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  introCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 14, shadowColor: '#17324D', shadowOpacity: 0.099, shadowRadius: 20, shadowOffset: { width: 10, height: 10 }, elevation: 7 },
  buddyPreview: { alignItems: 'center', backgroundColor: '#E8FBF5', borderRadius: 36, height: 120, justifyContent: 'center', width: 120 },
  previewImage: { height: 105, width: 105 },
  introTitle: { color: '#41438F', fontSize: 27, lineHeight: 34, textAlign: 'center' },
  introText: { color: '#536B73', fontSize: 16, lineHeight: 23, textAlign: 'center', margin: 6 },
  legendRow: { flexDirection: 'row', gap: 10, margin: 6 },
  legendPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 9 },
  legendGood: { color: '#129B65', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  legendBad: { color: '#D94B6A', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  rewardGuide: { color: '#765C13', fontSize: 12, lineHeight: 20, textAlign: 'center', margin: 6, fontFamily: 'Fredoka_700Bold' },
  primaryButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#6552EB', borderRadius: 999, minHeight: 52, justifyContent: 'center', marginTop: 10, marginBottom: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 19, letterSpacing: 0.8 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  gameWrap: { gap: 10 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hudPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 5, minHeight: 38, paddingHorizontal: 12 },
  hudText: { color: '#26373B', fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  hearts: { fontSize: 15 },
  arena: { backgroundColor: '#DDF8F3', borderColor: '#FFFFFF', borderRadius: 28, borderWidth: 5, elevation: 5, flexDirection: 'row', height: ARENA_HEIGHT, overflow: 'hidden', position: 'relative' },
  raceBackground: { ...StyleSheet.absoluteFillObject, height: '100%', width: '100%' },
  backgroundShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(218, 250, 247, 0.08)', zIndex: 1 },
  lane: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', borderLeftWidth: 1, height: '100%', width: '33.333%', zIndex: 2 },
  raceItem: { height: 64, position: 'absolute', width: 64, zIndex: 3 },
  player: { alignItems: 'center', bottom: 14, height: 82, justifyContent: 'center', position: 'absolute', width: '22%', zIndex: 5 },
  playerImage: { height: 82, width: 82 },
  touchHint: { flexDirection: 'row', gap: 9, justifyContent: 'center' },
  touchHintItem: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
  touchHintText: { color: '#536B73', fontSize: 12 },
  resultCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, gap: 14, borderWidth: 0, shadowColor: '#17324D', shadowOpacity: 0.099, shadowRadius: 20, shadowOffset: { width: 10, height: 10 }, elevation: 7 },
  resultEmoji: { fontSize: 64 },
  resultTitle: { color: '#41438F', fontSize: 28, lineHeight: 35, textAlign: 'center' },
  resultText: { color: '#536B73', fontSize: 16, lineHeight: 23, textAlign: 'center', margin: 10, fontFamily: 'Fredoka_700Bold' },
  scorePill: { backgroundColor: '#FFF4C7', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, margin: 5 },
  scorePillText: { color: '#8A6A1D', fontSize: 18 },
  rewardText: { color: '#F29A00', fontSize: 19 },
  noTriesText: { color: '#C8447C', fontSize: 15, lineHeight: 21, textAlign: 'center' }
});
