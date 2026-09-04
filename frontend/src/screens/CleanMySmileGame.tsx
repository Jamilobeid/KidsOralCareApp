import React, { useRef, useState } from 'react';
import { Image, ImageSourcePropType, LayoutAnimation, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';
type Stage = 'intro' | 'brushing' | 'flossing' | 'complete';
type Point = { x: number; y: number };
type BrushZone = { nameKey: string; instructionKey: string; image: ImageSourcePropType; arrow: keyof typeof Ionicons.glyphMap };
type FlossParticle = Point & { id: number; kind: 'brown' | 'yellow'; size: number };
type DebrisKind = 'greenGerm' | 'sugarCube' | 'pinkGerm' | 'grayPlaque' | 'purpleCandy';
type SurfaceDebris = Point & { id: number; kind: DebrisKind; zoneIndex: number; size: number };

const MOUTH_HEIGHT = 440;
const MOUTH_IMAGE_ASPECT_RATIO = 4 / 3;
const BRUSH_REWARD = 20;
const DEBRIS_BRUSH_PASSES = 3;
const PLAQUE_FLOSS_PASSES = 3;
const brushZones: BrushZone[] = [
  { nameKey: 'cleanFrontTeeth', instructionKey: 'cleanFrontInstruction', image: require('../../assets/images/clean-smile-front-teeth.png'), arrow: 'swap-horizontal' },
  { nameKey: 'cleanLeftBackTeeth', instructionKey: 'cleanLeftInstruction', image: require('../../assets/images/clean-smile-left-back-teeth.png'), arrow: 'swap-horizontal' },
  { nameKey: 'cleanRightBackTeeth', instructionKey: 'cleanRightInstruction', image: require('../../assets/images/clean-smile-right-back-teeth.png'), arrow: 'swap-horizontal' },
  { nameKey: 'cleanChewingSurfaces', instructionKey: 'cleanChewingInstruction', image: require('../../assets/images/clean-smile-chewing-surfaces.png'), arrow: 'swap-horizontal' }
];
const cleanMouthImage = require('../../assets/images/clean-smile-clean-mouth.png');
const flossParticles: FlossParticle[] = [
  { id: 1, kind: 'brown', x: 0.37, y: 0.32, size: 28 },
  { id: 2, kind: 'yellow', x: 0.48, y: 0.31, size: 31 },
  { id: 3, kind: 'brown', x: 0.60, y: 0.32, size: 28 },
  { id: 4, kind: 'yellow', x: 0.39, y: 0.68, size: 32 },
  { id: 5, kind: 'brown', x: 0.49, y: 0.70, size: 33 },
  { id: 6, kind: 'yellow', x: 0.61, y: 0.68, size: 32 },
  // Additional upper debris
  { id: 7, kind: 'yellow', x: 0.27, y: 0.41, size: 30 },
  { id: 8, kind: 'brown', x: 0.72, y: 0.41, size: 30 },

  // Additional lower debris
  { id: 9, kind: 'brown', x: 0.28, y: 0.60, size: 30 },
  { id: 10, kind: 'brown', x: 0.73, y: 0.60, size: 30 }
];
const debrisImages: Record<DebrisKind, ImageSourcePropType> = {
  greenGerm: require('../../assets/images/clean-smile-germ-green.png'),
  sugarCube: require('../../assets/images/clean-smile-sugar-cube.png'),
  pinkGerm: require('../../assets/images/clean-smile-germ-pink.png'),
  grayPlaque: require('../../assets/images/clean-smile-plaque-gray.png'),
  purpleCandy: require('../../assets/images/clean-smile-candy-purple.png')
};
const flossDebrisImages: Record<FlossParticle['kind'], ImageSourcePropType> = {
  brown: require('../../assets/images/clean-smile-floss-plaque-brown.png'),
  yellow: require('../../assets/images/clean-smile-floss-plaque-yellow.png')
};
const surfaceDebris: SurfaceDebris[] = [
  { id: 1, kind: 'greenGerm', zoneIndex: 0, x: 0.33, y: 0.29, size: 30 },
  { id: 2, kind: 'sugarCube', zoneIndex: 0, x: 0.43, y: 0.30, size: 30 },
  { id: 3, kind: 'pinkGerm', zoneIndex: 0, x: 0.54, y: 0.29, size: 30 },
  { id: 4, kind: 'grayPlaque', zoneIndex: 0, x: 0.64, y: 0.31, size: 30 },
  { id: 5, kind: 'purpleCandy', zoneIndex: 0, x: 0.35, y: 0.65, size: 32 },
  { id: 6, kind: 'greenGerm', zoneIndex: 0, x: 0.45, y: 0.67, size: 30 },
  { id: 7, kind: 'sugarCube', zoneIndex: 0, x: 0.55, y: 0.68, size: 30 },
  { id: 8, kind: 'pinkGerm', zoneIndex: 0, x: 0.65, y: 0.67, size: 30 },
  { id: 9, kind: 'grayPlaque', zoneIndex: 1, x: 0.44, y: 0.44, size: 40 },
  { id: 10, kind: 'greenGerm', zoneIndex: 1, x: 0.63, y: 0.45, size: 38 },
  { id: 11, kind: 'purpleCandy', zoneIndex: 1, x: 0.78, y: 0.46, size: 45 },
  { id: 12, kind: 'pinkGerm', zoneIndex: 1, x: 0.45, y: 0.58, size: 35 },
  { id: 13, kind: 'sugarCube', zoneIndex: 1, x: 0.58, y: 0.58, size: 35 },
  { id: 14, kind: 'grayPlaque', zoneIndex: 1, x: 0.74, y: 0.58, size: 38 },
  { id: 15, kind: 'greenGerm', zoneIndex: 2, x: 0.22, y: 0.43, size: 36 },
  { id: 16, kind: 'sugarCube', zoneIndex: 2, x: 0.39, y: 0.44, size: 35 },
  { id: 17, kind: 'purpleCandy', zoneIndex: 2, x: 0.56, y: 0.43, size: 42 },
  { id: 18, kind: 'pinkGerm', zoneIndex: 2, x: 0.22, y: 0.57, size: 36 },
  { id: 19, kind: 'grayPlaque', zoneIndex: 2, x: 0.39, y: 0.57, size: 38 },
  { id: 20, kind: 'greenGerm', zoneIndex: 2, x: 0.54, y: 0.57, size: 36 },
  { id: 21, kind: 'pinkGerm', zoneIndex: 3, x: 0.30, y: 0.28, size: 30 },
  { id: 22, kind: 'sugarCube', zoneIndex: 3, x: 0.30, y: 0.40, size: 28 },
  { id: 23, kind: 'grayPlaque', zoneIndex: 3, x: 0.65, y: 0.29, size: 32 },
  { id: 24, kind: 'purpleCandy', zoneIndex: 3, x: 0.67, y: 0.40, size: 40 },
  { id: 25, kind: 'greenGerm', zoneIndex: 3, x: 0.30, y: 0.69, size: 31 },
  { id: 26, kind: 'pinkGerm', zoneIndex: 3, x: 0.30, y: 0.57, size: 31 },
  { id: 27, kind: 'sugarCube', zoneIndex: 3, x: 0.67, y: 0.58, size: 31 },
  { id: 28, kind: 'grayPlaque', zoneIndex: 3, x: 0.66, y: 0.69, size: 31 }
];

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const toBoardPoint = (point: Point, boardWidth: number) => {
  const imageHeight = boardWidth / MOUTH_IMAGE_ASPECT_RATIO;
  const imageTop = (MOUTH_HEIGHT - imageHeight) / 2;
  return { x: point.x * boardWidth, y: imageTop + point.y * imageHeight };
};

export const CleanMySmileGame = ({ canPlayAgain, onComplete, onReplay, onStart }: { canPlayAgain: boolean; onComplete: (durationSeconds: number) => void; onReplay: () => boolean; onStart: () => boolean }) => {
  const { t } = useApp();
  const [stage, setStage] = useState<Stage>('intro');
  const [zoneIndex, setZoneIndex] = useState(0);
  const [cleanedZones, setCleanedZones] = useState<boolean[]>(brushZones.map(() => false));
  const [debrisBrushCounts, setDebrisBrushCounts] = useState<Record<number, number>>({});
  const [plaqueFlossCounts, setPlaqueFlossCounts] = useState<Record<number, number>>({});
  const [removedParticles, setRemovedParticles] = useState<number[]>([]);
  const [toolPosition, setToolPosition] = useState<Point>({ x: 170, y: 310 });
  const [mouthWidth, setMouthWidth] = useState(340);
  const lastTouchRef = useRef<Point | null>(null);
  const transitioningRef = useRef(false);
  const completedRef = useRef(false);
  const stageRef = useRef<Stage>('intro');
  const zoneIndexRef = useRef(0);
  const debrisBrushCountsRef = useRef<Record<number, number>>({});
  const activeDebrisContactsRef = useRef<Set<number>>(new Set());
  const plaqueFlossCountsRef = useRef<Record<number, number>>({});
  const activeFlossContactsRef = useRef<Set<number>>(new Set());
  const mouthWidthRef = useRef(340);
  const startedAtRef = useRef<number | null>(null);

  const reset = () => {
    if (stageRef.current === 'intro' && !onStart()) return;
    startedAtRef.current = Date.now();
    setStage('flossing');
    setZoneIndex(0);
    setCleanedZones(brushZones.map(() => false));
    setDebrisBrushCounts({});
    setPlaqueFlossCounts({});
    setRemovedParticles([]);
    setToolPosition({ x: 170, y: 310 });
    lastTouchRef.current = null;
    activeDebrisContactsRef.current.clear();
    activeFlossContactsRef.current.clear();
    transitioningRef.current = false;
    completedRef.current = false;
  };

  const completeZone = () => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    const currentZoneIndex = zoneIndexRef.current;
    setCleanedZones((current) => current.map((cleaned, index) => index === currentZoneIndex ? true : cleaned));
    if (currentZoneIndex === brushZones.length - 1) {
      completedRef.current = true;
      setStage('complete');
      const durationSeconds = startedAtRef.current === null ? Number.POSITIVE_INFINITY : (Date.now() - startedAtRef.current) / 1000;
      onComplete(durationSeconds);
    } else {
      zoneIndexRef.current = currentZoneIndex + 1;
      setZoneIndex(zoneIndexRef.current);
    }
    setTimeout(() => { transitioningRef.current = false; }, 250);
  };

  const handleBrushingMove = (point: Point) => {
    const previous = lastTouchRef.current;
    lastTouchRef.current = point;
    if (!previous || distance(point, previous) < 2) return;

    const currentZoneDebris = surfaceDebris.filter((debris) => debris.zoneIndex === zoneIndexRef.current);
    const currentContacts = new Set(currentZoneDebris
      .filter((debris) => (debrisBrushCountsRef.current[debris.id] ?? 0) < DEBRIS_BRUSH_PASSES)
      .filter((debris) => distance(point, toBoardPoint(debris, mouthWidthRef.current)) < debris.size / 2 + 28)
      .map((debris) => debris.id));
    const newContacts = [...currentContacts].filter((id) => !activeDebrisContactsRef.current.has(id));
    activeDebrisContactsRef.current = currentContacts;
    if (!newContacts.length) return;

    LayoutAnimation.configureNext({
      duration: 180,
      update: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
    });
    setDebrisBrushCounts((current) => {
      const next = { ...current };
      newContacts.forEach((id) => { next[id] = Math.min(DEBRIS_BRUSH_PASSES, (next[id] ?? 0) + 1); });
      debrisBrushCountsRef.current = next;
      if (currentZoneDebris.every((debris) => (next[debris.id] ?? 0) >= DEBRIS_BRUSH_PASSES)) completeZone();
      return next;
    });
  };

  const handleFlossMove = (point: Point) => {
    const currentContacts = new Set(flossParticles
      .filter((particle) => (plaqueFlossCountsRef.current[particle.id] ?? 0) < PLAQUE_FLOSS_PASSES)
      .filter((particle) => distance(point, toBoardPoint(particle, mouthWidthRef.current)) < particle.size / 2 + 25)
      .map((particle) => particle.id));
    const newContacts = [...currentContacts].filter((id) => !activeFlossContactsRef.current.has(id));
    activeFlossContactsRef.current = currentContacts;
    if (!newContacts.length) return;

    LayoutAnimation.configureNext({
      duration: 180,
      update: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
    });
    setPlaqueFlossCounts((current) => {
      const next = { ...current };
      newContacts.forEach((id) => { next[id] = Math.min(PLAQUE_FLOSS_PASSES, (next[id] ?? 0) + 1); });
      plaqueFlossCountsRef.current = next;
      const completedParticles = flossParticles.filter((particle) => (next[particle.id] ?? 0) >= PLAQUE_FLOSS_PASSES).map((particle) => particle.id);
      setRemovedParticles(completedParticles);
      if (completedParticles.length === flossParticles.length && !transitioningRef.current) {
        transitioningRef.current = true;
        setStage('brushing');
        setToolPosition({ x: mouthWidthRef.current / 2, y: 330 });
        setTimeout(() => { transitioningRef.current = false; }, 250);
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
    onPanResponderRelease: () => { lastTouchRef.current = null; activeDebrisContactsRef.current.clear(); activeFlossContactsRef.current.clear(); },
    onPanResponderTerminate: () => { lastTouchRef.current = null; activeDebrisContactsRef.current.clear(); activeFlossContactsRef.current.clear(); }
  })).current;

  stageRef.current = stage;
  zoneIndexRef.current = zoneIndex;
  debrisBrushCountsRef.current = debrisBrushCounts;
  plaqueFlossCountsRef.current = plaqueFlossCounts;
  mouthWidthRef.current = mouthWidth;

  const replay = () => {
    if (!canPlayAgain || !onReplay()) return;
    reset();
  };

  if (stage === 'intro') {
    return (
      <Card style={styles.introCard}>
        <View style={styles.guideRow}>
          <View style={styles.guideBubble}><Text style={[headingFont, styles.guideText]}>{t('cleanEveryTooth')}</Text></View>
        </View>
        <Image source={cleanMouthImage} style={styles.introMouth} resizeMode="contain" />
        <Text style={[headingFont, styles.introTitle]}>{t('flossThenBrush')}</Text>
        <View style={styles.stepsRow}>
          <View style={styles.stepPill}><Text style={styles.stepNumber}>1</Text><Text style={styles.stepText}>{t('floss')}</Text></View>
          <Ionicons name="arrow-forward" size={19} color="#698086" />
          <View style={styles.stepPill}><Text style={styles.stepNumber}>2</Text><Text style={styles.stepText}>{t('brushAction')}</Text></View>
        </View>
        <Pressable accessibilityRole="button" onPress={reset} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>{t('startCleaning')}</Text></Pressable>
      </Card>
    );
  }

  if (stage === 'complete') {
    return (
      <Card style={styles.completeCard}>
        <Image source={cleanMouthImage} style={styles.completeMouthImage} resizeMode="contain" />
        <Text style={[headingFont, styles.completeTitle]}>{t('sparklingClean')}</Text>
        <Text style={[bodyFont, styles.completeCopy]}>{t('cleanCompleteCopy')}</Text>
        <View style={styles.finalScore}><Text style={[headingFont, styles.finalScoreLabel]}>{t('finalScore')}</Text><Text style={[headingFont, styles.finalScoreValue]}>100 / 100</Text></View>
        <View style={styles.rewardPill}>
          <Image source={require('../../assets/images/game-clean-reward-star.png')} style={styles.rewardStarImage} resizeMode="contain" />
          <Text style={[headingFont, styles.rewardValue]}>+{BRUSH_REWARD}</Text>
        </View>
        {canPlayAgain ? <Pressable accessibilityRole="button" onPress={replay} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={[headingFont, styles.primaryButtonText]}>{t('cleanAgain')}</Text></Pressable> : null}
      </Card>
    );
  }

  const zone = brushZones[zoneIndex];
  const currentZoneDebris = surfaceDebris.filter((debris) => debris.zoneIndex === zoneIndex);
  const cleanedCurrentZoneDebris = currentZoneDebris.filter((debris) => (debrisBrushCounts[debris.id] ?? 0) >= DEBRIS_BRUSH_PASSES).length;
  const currentZoneBrushPasses = currentZoneDebris.reduce((total, debris) => total + (debrisBrushCounts[debris.id] ?? 0), 0);
  const zoneProgress = currentZoneDebris.length ? currentZoneBrushPasses / (currentZoneDebris.length * DEBRIS_BRUSH_PASSES) * 100 : 0;
  const flossProgress = flossParticles.reduce((total, particle) => total + (plaqueFlossCounts[particle.id] ?? 0), 0) / (flossParticles.length * PLAQUE_FLOSS_PASSES) * 100;
  const overallProgress = stage === 'flossing'
    ? flossProgress / (brushZones.length + 1)
    : (100 + cleanedZones.filter(Boolean).length * 100 + zoneProgress) / (brushZones.length + 1);

  return (
    <View style={styles.gameWrap}>
      <View style={styles.stageHeader}>
        <View style={styles.stagePill}><Ionicons name={stage === 'brushing' ? 'brush' : 'git-branch-outline'} size={19} color="#6552EB" /><Text style={styles.stagePillText}>{stage === 'brushing' ? `${t('brushing')} ${zoneIndex + 1}/${brushZones.length}` : t('flossing')}</Text></View>
        <Text style={[headingFont, styles.progressPercent]}>{Math.round(overallProgress)}%</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${overallProgress}%` as `${number}%` }]} /></View>
      <View style={styles.instructionCard}>
        <Ionicons name={stage === 'brushing' ? zone.arrow : 'swap-vertical'} size={28} color="#6552EB" />
        <View style={styles.instructionCopy}>
          <Text style={[headingFont, styles.instructionTitle]}>{stage === 'brushing' ? t(zone.nameKey) : t('flossBetweenTeeth')}</Text>
          <Text style={[bodyFont, styles.instructionText]}>{stage === 'brushing' ? `${t(zone.instructionKey)} • ${cleanedCurrentZoneDebris}/${currentZoneDebris.length}` : `${t('removeEveryPlaqueSpot')} • ${removedParticles.length}/${flossParticles.length}`}</Text>
        </View>
      </View>
      <View
        {...gestures.panHandlers}
        accessibilityLabel={stage === 'brushing' ? t('brushHighlightedZone').replace('{{zone}}', t(zone.nameKey)) : t('dragFlossAccessibility')}
        onLayout={(event) => {
          mouthWidthRef.current = event.nativeEvent.layout.width;
          setMouthWidth(event.nativeEvent.layout.width);
        }}
        style={styles.mouthBoard}
      >
        <Image source={stage === 'brushing' ? zone.image : cleanMouthImage} style={styles.mouthImage} resizeMode="contain" />
        {stage === 'brushing' ? surfaceDebris.map((debris) => {
          const brushCount = debrisBrushCounts[debris.id] ?? 0;
          if (debris.zoneIndex !== zoneIndex || brushCount >= DEBRIS_BRUSH_PASSES) return null;
          const position = toBoardPoint(debris, mouthWidth);
          const weakening = brushCount / DEBRIS_BRUSH_PASSES;
          return (
            <Image
              key={debris.id}
              resizeMode="contain"
              source={debrisImages[debris.kind]}
              style={[
                styles.surfaceDebris,
                {
                  height: debris.size,
                  left: position.x - debris.size / 2,
                  opacity: 1 - weakening * 0.7,
                  top: position.y - debris.size / 2,
                  transform: [{ scale: 1 - weakening * 0.28 }],
                  width: debris.size
                }
              ]}
            />
          );
        }) : null}
        {stage === 'flossing' ? flossParticles.map((particle) => {
          const flossCount = plaqueFlossCounts[particle.id] ?? 0;
          if (flossCount >= PLAQUE_FLOSS_PASSES) return null;
          const position = toBoardPoint(particle, mouthWidth);
          const weakening = flossCount / PLAQUE_FLOSS_PASSES;
          return <Image key={particle.id} source={flossDebrisImages[particle.kind]} resizeMode="contain" style={[styles.flossDebris, { height: particle.size, left: position.x - particle.size / 2, opacity: 1 - weakening * 0.7, top: position.y - particle.size / 2, transform: [{ scale: 1 - weakening * 0.28 }], width: particle.size }]} />;
        }) : null}
        {stage === 'brushing' ? (
          <View pointerEvents="none" style={[styles.toothbrushTool, { left: toolPosition.x - 25, top: toolPosition.y - 63 }]}>
            <Image source={require('../../assets/images/custom-home-toothbrush.png')} style={styles.toothbrushImage} resizeMode="contain" />
          </View>
        ) : (
          <View pointerEvents="none" style={[styles.flossTool, { left: toolPosition.x - 39, top: toolPosition.y - 26 }]}>
            <Image source={require('../../assets/images/clean-smile-dental-floss-tool.png')} style={styles.flossToolImage} resizeMode="contain" />
          </View>
        )}
      </View>
      <Text style={[bodyFont, styles.dragHint]}>{stage === 'brushing' ? t('cleanBrushDragHint') : t('cleanFlossDragHint')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  introCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 13, padding: 22, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  guideRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  guideBubble: { backgroundColor: '#E9FFF8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  guideText: { color: '#28535A', fontSize: 17 },
  introMouth: { height: 180, width: '100%' },
  introTitle: { color: '#41438F', fontSize: 28, lineHeight: 40, textAlign: 'center' },
  stepsRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  stepPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 15, marginTop: 10 },
  stepNumber: { backgroundColor: '#6552EB', borderRadius: 12, color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 2 },
  stepText: { color: '#536B73', fontFamily: 'Fredoka_700Bold', fontSize: 12 },
  primaryButton: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#6552EB', borderRadius: 999, justifyContent: 'center', minHeight: 52 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, letterSpacing: 0.7 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  gameWrap: { gap: 11 },
  stageHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  stagePill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, elevation: 2, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 8, margin: 7 },
  stagePillText: { color: '#41438F', fontSize: 13, fontFamily: 'Fredoka_700Bold' },
  progressPercent: { color: '#168954', fontSize: 17 },
  progressTrack: { backgroundColor: '#DDE9EA', borderRadius: 999, height: 10, overflow: 'hidden' },
  progressFill: { backgroundColor: '#35C5B4', borderRadius: 999, height: '100%' },
  instructionCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 2, flexDirection: 'row', gap: 11, padding: 12, fontFamily: 'Fredoka_700Bold' },
  instructionCopy: { flex: 1 },
  instructionTitle: { color: '#314950', fontSize: 17, lineHeight: 21 },
  instructionText: { color: '#6A8085', fontSize: 12, lineHeight: 20, fontFamily: 'Fredoka_700Bold' },
  mouthBoard: { backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, elevation: 4, height: MOUTH_HEIGHT, overflow: 'hidden', position: 'relative', shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  mouthImage: { height: '100%', width: '100%' },
  surfaceDebris: { position: 'absolute', zIndex: 2 },
  toothbrushTool: { height: 130, position: 'absolute', transform: [{ rotate: '-80deg' }], width: 90 },
  toothbrushImage: { height: 130, width: 90 },
  flossDebris: { position: 'absolute', zIndex: 3 },
  flossTool: { height: 100, position: 'absolute', width: 78, zIndex: 5 },
  flossToolImage: { height: 100, width: 78 },
  dragHint: { color: '#607A80', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  completeCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 13, padding: 24, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  completeMouthImage: { height: 210, width: '100%' },
  completeTitle: { color: '#41438F', fontSize: 29, lineHeight: 40 },
  completeCopy: { color: '#5B7379', fontSize: 15, lineHeight: 24, textAlign: 'center', fontFamily: 'Fredoka_700Bold', margin: 8, marginBottom: 10  },
  finalScore: { alignItems: 'center', backgroundColor: '#E9FFF8', borderRadius: 22, minWidth: 180, padding: 14, marginBottom:10 },
  finalScoreLabel: { color: '#168954', fontSize: 12, letterSpacing: 1 },
  finalScoreValue: { color: '#173D3B', fontSize: 25 },
  rewardPill: { alignItems: 'center', backgroundColor: '#E8ECEB', borderRadius: 999, flexDirection: 'row', gap: 5, paddingHorizontal: 13, paddingVertical: 7 },
  rewardStarImage: { height: 34, width: 34 },
  rewardValue: { color: '#171B1B', fontSize: 20, lineHeight: 25 },
  noTriesText: { color: '#C8447C', fontSize: 15, lineHeight: 21, textAlign: 'center' }
});
