import React, { useRef, useState } from 'react';
import { Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
import { bodyFont, headingFont } from '../utils/kidStyle';

type Stage = 'intro' | 'brushing' | 'flossing' | 'complete';
type Point = { x: number; y: number };
type BrushZone = { name: string; instruction: string; x: number; y: number; radius: number; arrow: keyof typeof Ionicons.glyphMap };
type FoodParticle = Point & { id: number };

const MOUTH_HEIGHT = 390;
const BRUSH_REWARD = 20;
const brushZones: BrushZone[] = [
  { name: 'Front teeth', instruction: 'Brush gently from side to side', x: 0.5, y: 0.34, radius: 72, arrow: 'swap-horizontal' },
  { name: 'Inner surfaces', instruction: 'Move the brush up and down', x: 0.5, y: 0.55, radius: 78, arrow: 'swap-vertical' },
  { name: 'Chewing surfaces', instruction: 'Use short back-and-forth strokes', x: 0.5, y: 0.72, radius: 72, arrow: 'swap-horizontal' },
  { name: 'Back teeth & molars', instruction: 'Reach both sides of the back teeth', x: 0.5, y: 0.48, radius: 145, arrow: 'git-compare-outline' }
];
const foodParticles: FoodParticle[] = [
  { id: 1, x: 0.33, y: 0.31 }, { id: 2, x: 0.46, y: 0.27 }, { id: 3, x: 0.59, y: 0.30 },
  { id: 4, x: 0.37, y: 0.72 }, { id: 5, x: 0.51, y: 0.76 }, { id: 6, x: 0.64, y: 0.70 }
];

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const CleanMySmileGame = ({ canPlayAgain, onComplete, onReplay }: { canPlayAgain: boolean; onComplete: () => void; onReplay: () => boolean }) => {
  const { child } = useApp();
  const buddy = toothBuddies.find((item) => item.id === child.selectedCharacter) ?? toothBuddies[0];
  const [stage, setStage] = useState<Stage>('intro');
  const [zoneIndex, setZoneIndex] = useState(0);
  const [zoneProgress, setZoneProgress] = useState(0);
  const [cleanedZones, setCleanedZones] = useState<boolean[]>(brushZones.map(() => false));
  const [removedParticles, setRemovedParticles] = useState<number[]>([]);
  const [toolPosition, setToolPosition] = useState<Point>({ x: 170, y: 310 });
  const [mouthWidth, setMouthWidth] = useState(340);
  const lastTouchRef = useRef<Point | null>(null);
  const transitioningRef = useRef(false);
  const completedRef = useRef(false);
  const stageRef = useRef<Stage>('intro');
  const zoneIndexRef = useRef(0);
  const removedParticlesRef = useRef<number[]>([]);
  const mouthWidthRef = useRef(340);

  const reset = () => {
    setStage('brushing');
    setZoneIndex(0);
    setZoneProgress(0);
    setCleanedZones(brushZones.map(() => false));
    setRemovedParticles([]);
    setToolPosition({ x: 170, y: 310 });
    lastTouchRef.current = null;
    transitioningRef.current = false;
    completedRef.current = false;
  };

  const completeZone = () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    const currentZoneIndex = zoneIndexRef.current;
    setCleanedZones((current) => current.map((cleaned, index) => index === currentZoneIndex ? true : cleaned));
    if (currentZoneIndex === brushZones.length - 1) {
      setStage('flossing');
      setToolPosition({ x: mouthWidthRef.current / 2, y: 330 });
    } else {
      zoneIndexRef.current = currentZoneIndex + 1;
      setZoneIndex(zoneIndexRef.current);
      setZoneProgress(0);
    }
    setTimeout(() => { transitioningRef.current = false; }, 250);
  };

  const handleBrushingMove = (point: Point) => {
    const zone = brushZones[zoneIndexRef.current];
    const target = { x: zone.x * mouthWidthRef.current, y: zone.y * MOUTH_HEIGHT };
    const previous = lastTouchRef.current;
    lastTouchRef.current = point;
    if (distance(point, target) > zone.radius || !previous) return;
    const strokeDistance = distance(point, previous);
    if (strokeDistance < 3) return;
    setZoneProgress((current) => {
      const next = Math.min(100, current + Math.min(10, strokeDistance / 3));
      if (next >= 100) completeZone();
      return next;
    });
  };

  const handleFlossMove = (point: Point) => {
    const newlyRemoved = foodParticles
      .filter((particle) => !removedParticlesRef.current.includes(particle.id))
      .filter((particle) => distance(point, { x: particle.x * mouthWidthRef.current, y: particle.y * MOUTH_HEIGHT }) < 34)
      .map((particle) => particle.id);
    if (!newlyRemoved.length) return;
    setRemovedParticles((current) => {
      const next = [...new Set([...current, ...newlyRemoved])];
      removedParticlesRef.current = next;
      if (next.length === foodParticles.length && !completedRef.current) {
        completedRef.current = true;
        setStage('complete');
        onComplete();
      }
      return next;
    });
  };

  const gestures = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
      lastTouchRef.current = point;
      setToolPosition(point);
    },
    onPanResponderMove: (event) => {
      const point = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
      setToolPosition(point);
      if (stageRef.current === 'brushing') handleBrushingMove(point);
      if (stageRef.current === 'flossing') handleFlossMove(point);
    },
    onPanResponderRelease: () => { lastTouchRef.current = null; },
    onPanResponderTerminate: () => { lastTouchRef.current = null; }
  })).current;

  stageRef.current = stage;
  zoneIndexRef.current = zoneIndex;
  removedParticlesRef.current = removedParticles;
  mouthWidthRef.current = mouthWidth;

  const replay = () => {
    if (!canPlayAgain || !onReplay()) return;
    reset();
  };

  if (stage === 'intro') {
    return (
      <Card style={styles.introCard}>
        <View style={styles.guideRow}>
          <Image source={buddy.image} style={styles.guideBuddy} resizeMode="contain" />
          <View style={styles.guideBubble}><Text style={[headingFont, styles.guideText]}>Let’s clean every tooth!</Text></View>
        </View>
        <Image source={require('../../assets/images/brushing-mouth.png')} style={styles.introMouth} resizeMode="contain" />
        <Text style={[headingFont, styles.introTitle]}>Brush, then floss!</Text>
        <Text style={[bodyFont, styles.introCopy]}>Drag the toothbrush through each highlighted area. When every surface is clean, use the floss to remove food between the teeth.</Text>
        <View style={styles.stepsRow}>
          <View style={styles.stepPill}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepText}>BRUSH</Text></View>
          <Ionicons name="arrow-forward" size={19} color="#698086" />
          <View style={styles.stepPill}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepText}>FLOSS</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={reset} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>START CLEANING</Text></Pressable>
      </Card>
    );
  }

  if (stage === 'complete') {
    return (
      <Card style={styles.completeCard}>
        <Text style={styles.completeEmoji}>✨🦷✨</Text>
        <Text style={[headingFont, styles.completeTitle]}>Sparkling clean!</Text>
        <Text style={[bodyFont, styles.completeCopy]}>You cleaned every tooth surface and flossed away all the food particles.</Text>
        <View style={styles.finalScore}><Text style={[headingFont, styles.finalScoreLabel]}>FINAL SCORE</Text><Text style={[headingFont, styles.finalScoreValue]}>100 / 100</Text></View>
        <Text style={[headingFont, styles.rewardText]}>+{BRUSH_REWARD} SMILE STARS</Text>
        {canPlayAgain ? <Pressable accessibilityRole="button" onPress={replay} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>CLEAN AGAIN</Text></Pressable> : <Text style={[bodyFont, styles.noTriesText]}>All cleaning games are finished today. Come back tomorrow!</Text>}
      </Card>
    );
  }

  const zone = brushZones[zoneIndex];
  const overallProgress = stage === 'brushing'
    ? (cleanedZones.filter(Boolean).length * 100 + zoneProgress) / (brushZones.length + 1)
    : (brushZones.length * 100 + removedParticles.length / foodParticles.length * 100) / (brushZones.length + 1);

  return (
    <View style={styles.gameWrap}>
      <View style={styles.stageHeader}>
        <View style={styles.stagePill}><Ionicons name={stage === 'brushing' ? 'brush' : 'git-branch-outline'} size={19} color="#6552EB" /><Text style={[headingFont, styles.stagePillText]}>{stage === 'brushing' ? `BRUSHING ${zoneIndex + 1}/4` : 'FLOSSING'}</Text></View>
        <Text style={[headingFont, styles.progressPercent]}>{Math.round(overallProgress)}%</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${overallProgress}%` as `${number}%` }]} /></View>
      <View style={styles.instructionCard}>
        <Ionicons name={stage === 'brushing' ? zone.arrow : 'swap-vertical'} size={28} color="#6552EB" />
        <View style={styles.instructionCopy}>
          <Text style={[headingFont, styles.instructionTitle]}>{stage === 'brushing' ? zone.name : 'Floss between the teeth'}</Text>
          <Text style={[bodyFont, styles.instructionText]}>{stage === 'brushing' ? zone.instruction : `Remove every food particle • ${removedParticles.length}/${foodParticles.length}`}</Text>
        </View>
      </View>
      <View
        {...gestures.panHandlers}
        accessibilityLabel={stage === 'brushing' ? `Brush the highlighted ${zone.name}` : 'Drag the floss over every food particle'}
        onLayout={(event) => {
          mouthWidthRef.current = event.nativeEvent.layout.width;
          setMouthWidth(event.nativeEvent.layout.width);
        }}
        style={styles.mouthBoard}
      >
        <Image source={require('../../assets/images/brushing-mouth.png')} style={styles.mouthImage} resizeMode="contain" />
        {stage === 'brushing' ? (
          <View style={[styles.highlight, { height: zone.radius * 1.25, left: zone.x * mouthWidth - zone.radius * 0.75, top: zone.y * MOUTH_HEIGHT - zone.radius * 0.62, width: zone.radius * 1.5 }]}>
            <Ionicons name={zone.arrow} size={31} color="#FFFFFF" />
          </View>
        ) : foodParticles.map((particle) => removedParticles.includes(particle.id) ? null : (
          <View key={particle.id} style={[styles.foodParticle, { left: particle.x * mouthWidth - 11, top: particle.y * MOUTH_HEIGHT - 11 }]}><Ionicons name="ellipse" size={13} color="#F28C28" /></View>
        ))}
        {stage === 'brushing' ? (
          <View pointerEvents="none" style={[styles.toothbrushTool, { left: toolPosition.x - 25, top: toolPosition.y - 63 }]}>
            <Image source={require('../../assets/images/custom-home-toothbrush.png')} style={styles.toothbrushImage} resizeMode="contain" />
          </View>
        ) : (
          <View pointerEvents="none" style={[styles.flossTool, { left: toolPosition.x - 28, top: toolPosition.y - 31 }]}>
            <View style={styles.flossHandleLeft} /><View style={styles.flossThread} /><View style={styles.flossHandleRight} />
          </View>
        )}
      </View>
      <Text style={[bodyFont, styles.dragHint]}>Keep your finger on the screen and follow the highlighted guidance.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  introCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, gap: 13, padding: 22 },
  guideRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  guideBuddy: { height: 85, width: 85 },
  guideBubble: { backgroundColor: '#E9FFF8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  guideText: { color: '#28535A', fontSize: 15 },
  introMouth: { height: 180, width: '100%' },
  introTitle: { color: '#41438F', fontSize: 28, lineHeight: 35, textAlign: 'center' },
  introCopy: { color: '#5B7379', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  stepsRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  stepPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 8 },
  stepNumber: { backgroundColor: '#6552EB', borderRadius: 12, color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 2 },
  stepText: { color: '#536B73', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  primaryButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#6552EB', borderRadius: 999, justifyContent: 'center', minHeight: 52 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, letterSpacing: 0.7 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  gameWrap: { gap: 11 },
  stageHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stagePill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 8 },
  stagePillText: { color: '#41438F', fontSize: 13 },
  progressPercent: { color: '#168954', fontSize: 17 },
  progressTrack: { backgroundColor: '#DDE9EA', borderRadius: 999, height: 10, overflow: 'hidden' },
  progressFill: { backgroundColor: '#35C5B4', borderRadius: 999, height: '100%' },
  instructionCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 2, flexDirection: 'row', gap: 11, padding: 12 },
  instructionCopy: { flex: 1 },
  instructionTitle: { color: '#314950', fontSize: 17, lineHeight: 21 },
  instructionText: { color: '#6A8085', fontSize: 13, lineHeight: 18 },
  mouthBoard: { backgroundColor: '#F7FFFC', borderColor: '#FFFFFF', borderRadius: 28, borderWidth: 5, elevation: 5, height: MOUTH_HEIGHT, overflow: 'hidden', position: 'relative' },
  mouthImage: { height: '100%', width: '100%' },
  highlight: { alignItems: 'center', backgroundColor: 'rgba(53,197,180,0.50)', borderColor: '#FFFFFF', borderRadius: 999, borderWidth: 3, justifyContent: 'center', position: 'absolute' },
  toothbrushTool: { height: 100, position: 'absolute', transform: [{ rotate: '-25deg' }], width: 50 },
  toothbrushImage: { height: 100, width: 50 },
  foodParticle: { alignItems: 'center', backgroundColor: '#FFF1C9', borderColor: '#FFFFFF', borderRadius: 11, borderWidth: 2, height: 22, justifyContent: 'center', position: 'absolute', width: 22 },
  flossTool: { alignItems: 'flex-start', flexDirection: 'row', height: 62, position: 'absolute', width: 56 },
  flossHandleLeft: { backgroundColor: '#35C5B4', borderRadius: 5, height: 48, width: 9 },
  flossThread: { borderBottomColor: '#FFFFFF', borderBottomWidth: 3, height: 38, width: 38 },
  flossHandleRight: { backgroundColor: '#35C5B4', borderRadius: 5, height: 48, width: 9 },
  dragHint: { color: '#607A80', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  completeCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, gap: 13, padding: 24 },
  completeEmoji: { fontSize: 54 },
  completeTitle: { color: '#41438F', fontSize: 29, lineHeight: 36 },
  completeCopy: { color: '#5B7379', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  finalScore: { alignItems: 'center', backgroundColor: '#E9FFF8', borderRadius: 22, minWidth: 180, padding: 14 },
  finalScoreLabel: { color: '#168954', fontSize: 12, letterSpacing: 1 },
  finalScoreValue: { color: '#173D3B', fontSize: 25 },
  rewardText: { color: '#F29A00', fontSize: 19 },
  noTriesText: { color: '#C8447C', fontSize: 15, lineHeight: 21, textAlign: 'center' }
});
