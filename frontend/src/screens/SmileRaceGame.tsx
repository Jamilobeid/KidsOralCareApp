import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { toothBuddies } from '../data/toothBuddies';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

type ItemKind = 'star' | 'water' | 'food' | 'germ' | 'candy' | 'soda';
type RaceItem = { id: number; kind: ItemKind; lane: number; y: number };
type RaceStatus = 'ready' | 'running' | 'finished';

const TICK_MS = 80;
const PLAYER_Y = 326;
const getSmileStarReward = (score: number) => {
  if (score >= 35) return 20;
  if (score >= 20) return 15;
  if (score >= 10) return 10;
  if (score >= 5) return 5;
  return 0;
};
const itemImages: Record<ItemKind, ImageSourcePropType> = {
  star: require('../../assets/images/game-reward-star.png'),
  water: require('../../assets/images/game-genius-milk.png'),
  food: require('../../assets/images/game-healthy-apple.png'),
  germ: require('../../assets/images/game-rescue-germ.png'),
  candy: require('../../assets/images/game-rescue-candy.png'),
  soda: require('../../assets/images/game-genius-soda.png')
};
const goodKinds: ItemKind[] = ['star', 'water', 'food'];
const badKinds: ItemKind[] = ['germ', 'candy', 'soda'];

export const SmileRaceGame = ({ canPlayAgain, onComplete, onReplay }: { canPlayAgain: boolean; onComplete: (smileStars: number) => void; onReplay: () => boolean }) => {
  const { child } = useApp();
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
  const statusRef = useRef<RaceStatus>('ready');

  const resetRace = () => {
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
      const difficulty = Math.min(7, 1 + scoreRef.current / 5);
      const speed = 4.5 + difficulty * 1.15;
      const spawnEvery = Math.max(260, 900 - scoreRef.current * 16);
      setItems((current) => {
        const next: RaceItem[] = [];
        current.forEach((item) => {
          const moved = { ...item, y: item.y + speed };
          const reachedPlayer = item.y < PLAYER_Y && moved.y >= PLAYER_Y;
          if (reachedPlayer && moved.lane === laneRef.current) {
            if (goodKinds.includes(moved.kind)) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
            } else if (!jumpingRef.current) {
              livesRef.current = Math.max(0, livesRef.current - 1);
              setLives(livesRef.current);
            }
            return;
          }
          if (moved.y < 410) next.push(moved);
        });

        if (spawnElapsedRef.current >= spawnEvery) {
          spawnElapsedRef.current = 0;
          const obstacleChance = Math.min(0.76, 0.38 + scoreRef.current / 100);
          const pool = Math.random() < obstacleChance ? badKinds : goodKinds;
          next.push({
            id: nextIdRef.current++,
            kind: pool[Math.floor(Math.random() * pool.length)],
            lane: Math.floor(Math.random() * 3),
            y: -48
          });
        }
        return next;
      });

      if (livesRef.current <= 0) {
        if (!awardedRef.current) {
          awardedRef.current = true;
          onComplete(getSmileStarReward(scoreRef.current));
        }
        setStatus('finished');
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [onComplete, status]);

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
    onPanResponderGrant: (event) => {
      const nextLane = Math.max(0, Math.min(2, Math.floor(event.nativeEvent.locationX / (arenaWidthRef.current / 3))));
      laneRef.current = nextLane;
      setLane(nextLane);
    },
    onPanResponderMove: (event) => {
      const nextLane = Math.max(0, Math.min(2, Math.floor(event.nativeEvent.locationX / (arenaWidthRef.current / 3))));
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
        <Text style={[headingFont, styles.introTitle]}>Ready, set, smile!</Text>
        <Text style={[bodyFont, styles.introText]}>Drag your finger left or right to move {buddy.title}, and tap the track to jump. Keep racing for a higher score—the game gets faster as your score grows!</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendPill}><Ionicons name="sparkles" size={18} color="#129B65" /><Text style={styles.legendGood}>COLLECT</Text></View>
          <View style={styles.legendPill}><Ionicons name="warning" size={18} color="#D94B6A" /><Text style={styles.legendBad}>AVOID</Text></View>
        </View>
        <Text style={[bodyFont, styles.rewardGuide]}>5 points = 5 stars  •  10 = 10 stars  •  20 = 15 stars  •  35+ = 20 stars</Text>
        <Pressable accessibilityRole="button" onPress={resetRace} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>START RACE</Text></Pressable>
      </Card>
    );
  }

  if (status === 'finished') {
    const smileStars = getSmileStarReward(score);
    return (
      <Card style={styles.resultCard}>
        <Text style={styles.resultEmoji}>🏆</Text>
        <Text style={[headingFont, styles.resultTitle]}>Great racing!</Text>
        <Text style={[bodyFont, styles.resultText]}>The track got tricky, but {buddy.title} achieved a score of {score}!</Text>
        <View style={styles.scorePill}><Text style={[headingFont, styles.scorePillText]}>Score: {score}</Text></View>
        {smileStars > 0 ? <Text style={[headingFont, styles.rewardText]}>+{smileStars} SMILE STARS</Text> : <Text style={[bodyFont, styles.nextRewardText]}>Reach 5 points next time to earn Smile Stars!</Text>}
        {canPlayAgain ? <Pressable accessibilityRole="button" onPress={replay} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>RACE AGAIN</Text></Pressable> : <Text style={[bodyFont, styles.noTriesText]}>All races finished for today. Come back tomorrow!</Text>}
      </Card>
    );
  }

  return (
    <View style={styles.gameWrap}>
      <View style={styles.hudRow}>
        <View style={styles.hudPill}><Ionicons name="star" size={18} color="#F7B500" /><Text style={styles.hudText}>{score}</Text></View>
        <View style={styles.hudPill}><Ionicons name="speedometer" size={18} color="#6552EB" /><Text style={styles.hudText}>Speed {Math.min(8, 1 + Math.floor(score / 5))}</Text></View>
        <View style={styles.hudPill}><Text style={styles.hearts}>{'❤️'.repeat(lives)}</Text></View>
      </View>
      <View
        {...raceGestures.panHandlers}
        accessibilityLabel="Smile Race track. Drag left or right to move and tap to jump."
        onLayout={(event) => { arenaWidthRef.current = event.nativeEvent.layout.width; }}
        style={styles.arena}
      >
        {[0, 1, 2].map((trackLane) => <View key={trackLane} style={[styles.lane, trackLane < 2 && styles.laneDivider]} />)}
        {items.map((item) => item.kind === 'water' ? (
          <View key={item.id} style={[styles.raceItem, styles.waterDrop, { left: `${item.lane * 33.333 + 8}%` as `${number}%`, top: item.y }]}>
            <Ionicons name="water" size={38} color="#2C9EF2" />
          </View>
        ) : (
          <Image key={item.id} source={itemImages[item.kind]} style={[styles.raceItem, { left: `${item.lane * 33.333 + 8}%` as `${number}%`, top: item.y }]} resizeMode="contain" />
        ))}
        <View style={[styles.player, { left: `${lane * 33.333 + 5.5}%` as `${number}%`, transform: [{ translateY: jumping ? -74 : 0 }, { rotate: jumping ? '-8deg' : '0deg' }] }]}>
          <Image source={buddy.image} style={styles.playerImage} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.touchHint}>
        <View style={styles.touchHintItem}><Ionicons name="hand-left" size={22} color="#6552EB" /><Text style={[headingFont, styles.touchHintText]}>DRAG TO MOVE</Text></View>
        <View style={styles.touchHintItem}><Ionicons name="finger-print" size={22} color="#35A99A" /><Text style={[headingFont, styles.touchHintText]}>TAP TO JUMP</Text></View>
      </View>
      <Text style={[bodyFont, styles.difficultyHint]}>No time limit—keep going! Every 5 points increases the speed and challenge.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  introCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, gap: 14, padding: 22 },
  buddyPreview: { alignItems: 'center', backgroundColor: '#E8FBF5', borderRadius: 36, height: 120, justifyContent: 'center', width: 120 },
  previewImage: { height: 105, width: 105 },
  introTitle: { color: '#41438F', fontSize: 27, lineHeight: 34, textAlign: 'center' },
  introText: { color: '#536B73', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  legendRow: { flexDirection: 'row', gap: 10 },
  legendPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 9 },
  legendGood: { color: '#129B65', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  legendBad: { color: '#D94B6A', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  rewardGuide: { color: '#765C13', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  primaryButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#6552EB', borderRadius: 999, minHeight: 52, justifyContent: 'center', marginTop: 5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 19, letterSpacing: 0.8 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  gameWrap: { gap: 10 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hudPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 5, minHeight: 38, paddingHorizontal: 12 },
  hudText: { color: '#26373B', fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  hearts: { fontSize: 15 },
  arena: { backgroundColor: '#DDF8F3', borderColor: '#FFFFFF', borderRadius: 28, borderWidth: 5, elevation: 5, flexDirection: 'row', height: 420, overflow: 'hidden', position: 'relative' },
  lane: { backgroundColor: 'rgba(255,255,255,0.18)', height: '100%', width: '33.333%' },
  laneDivider: { borderRightColor: 'rgba(65,67,143,0.17)', borderRightWidth: 2 },
  raceItem: { height: 55, position: 'absolute', width: 55, zIndex: 3 },
  waterDrop: { alignItems: 'center', backgroundColor: '#EAF7FF', borderRadius: 20, justifyContent: 'center' },
  player: { alignItems: 'center', bottom: 14, height: 82, justifyContent: 'center', position: 'absolute', width: '22%', zIndex: 5 },
  playerImage: { height: 82, width: 82 },
  touchHint: { flexDirection: 'row', gap: 9, justifyContent: 'center' },
  touchHintItem: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
  touchHintText: { color: '#536B73', fontSize: 12 },
  difficultyHint: { color: '#607A80', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  resultCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, gap: 13, padding: 24 },
  resultEmoji: { fontSize: 64 },
  resultTitle: { color: '#41438F', fontSize: 28, lineHeight: 35, textAlign: 'center' },
  resultText: { color: '#536B73', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  scorePill: { backgroundColor: '#FFF4C7', borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  scorePillText: { color: '#8A6A1D', fontSize: 18 },
  rewardText: { color: '#F29A00', fontSize: 19 },
  nextRewardText: { color: '#607A80', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  noTriesText: { color: '#C8447C', fontSize: 15, lineHeight: 21, textAlign: 'center' }
});
