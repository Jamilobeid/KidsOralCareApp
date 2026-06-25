import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { rewardFont } from '../utils/kidStyle';

const totalSeconds = 120;
const steps = ['upperLeft', 'upperRight', 'lowerLeft', 'lowerRight', 'frontTeeth', 'tongue'];
const brushPositions = [
  { x: -88, y: -72, rotate: -26 },
  { x: 84, y: -72, rotate: 28 },
  { x: -82, y: 56, rotate: -132 },
  { x: 82, y: 56, rotate: 132 },
  { x: 0, y: -58, rotate: 4 },
  { x: 0, y: 28, rotate: 92 }
];

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

export const BrushingTimerScreen = () => {
  const { t, theme, completeBrushing } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const wiggle = useRef(new Animated.Value(0)).current;
  const hourglassMotion = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;
  const brushX = useRef(new Animated.Value(brushPositions[0].x)).current;
  const brushY = useRef(new Animated.Value(brushPositions[0].y)).current;
  const brushAngle = useRef(new Animated.Value(brushPositions[0].rotate)).current;

  const stepIndex = Math.min(steps.length - 1, Math.floor((totalSeconds - secondsLeft) / (totalSeconds / steps.length)));
  const progress = useMemo(() => 1 - secondsLeft / totalSeconds, [secondsLeft]);
  const position = brushPositions[stepIndex];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    ).start();
  }, [wiggle]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hourglassMotion, { toValue: 1, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(hourglassMotion, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    ).start();
  }, [hourglassMotion]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(brushX, { toValue: position.x, duration: 430, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(brushY, { toValue: position.y, duration: 430, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(brushAngle, { toValue: position.rotate, duration: 430, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [brushAngle, brushX, brushY, position.rotate, position.x, position.y]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(timerPulse, { toValue: 1.08, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(timerPulse, { toValue: 1, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true })
    ]).start();
  }, [secondsLeft, timerPulse]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
      setFinished(true);
      completeBrushing();
    }
  }, [secondsLeft, running, completeBrushing]);

  const minutes = Math.floor(secondsLeft / 60).toString();
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const brushMove = wiggle.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  const brushRotate = brushAngle.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const hourglassRotate = hourglassMotion.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '5deg'] });
  const hourglassScale = hourglassMotion.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });

  const resetTimer = () => {
    setRunning(false);
    setFinished(false);
    setSecondsLeft(totalSeconds);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Title size={34}>{t('timerTitle')}</Title>
        <BodyText>{t('timerInstruction')}</BodyText>
      </View>
      <Card style={styles.centerCard}>
        <View style={styles.mouthScene}>
          <Image source={require('../../assets/images/mouth-guide-white.png')} style={styles.mouthImage} resizeMode="contain" />
          <AnimatedImage
            source={require('../../assets/images/home-toothbrush.png')}
            style={[
              styles.brushImage,
              {
                transform: [
                  { translateX: brushX },
                  { translateY: Animated.add(brushY, brushMove) },
                  { rotate: brushRotate }
                ]
              }
            ]}
            resizeMode="contain"
          />
        </View>

        <AnimatedText style={[styles.timer, { color: theme.primary, transform: [{ scale: timerPulse }] }]}>
          {minutes}:{seconds}
        </AnimatedText>

        <AnimatedImage
          source={require('../../assets/images/timer-hourglass.png')}
          style={[styles.hourglassImage, { transform: [{ rotate: hourglassRotate }, { scale: hourglassScale }] }]}
          resizeMode="contain"
        />

        <View style={styles.progressShell}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={[rewardFont, styles.step, { color: theme.text }]}>→ {t(steps[stepIndex])}</Text>
        {finished ? (
          <View style={styles.doneBox}>
            <Text style={[rewardFont, styles.congrats, { color: theme.primary }]}>{t('congratulations')}</Text>
            <Text style={[rewardFont, styles.doneText, { color: theme.text }]}>{t('brushingCompleted')}</Text>
            <Text style={[rewardFont, styles.party, { color: theme.primary }]}>Great job!</Text>
          </View>
        ) : null}
      </Card>
      <View style={styles.buttons}>
        <AppButton style={styles.button} label={running ? t('pause') : t('startTimer')} onPress={() => setRunning((value) => !value)} />
        <AppButton style={[styles.button, { backgroundColor: '#FFB703' }]} label={t('reset')} onPress={resetTimer} variant="secondary" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { gap: 4, paddingTop: 8 },
  centerCard: { alignItems: 'center', gap: 14 },
  mouthScene: { width: '100%', height: 250, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  mouthImage: { width: 330, height: 230, borderRadius: 24, backgroundColor: '#FFFFFF' },
  brushImage: { position: 'absolute', width: 88, height: 88 },
  timer: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Consolas' }),
    fontSize: 60,
    lineHeight: 70,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  hourglassImage: { width: 72, height: 82 },
  progressShell: { width: '100%', height: 18, borderRadius: 9, backgroundColor: '#DCEAF4', overflow: 'hidden', marginTop: 2 },
  progressFill: { height: '100%', borderRadius: 9 },
  step: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10 },
  button: { flex: 1 },
  doneBox: { alignItems: 'center', gap: 4, marginTop: 4 },
  congrats: { fontSize: 30, fontWeight: '900', textAlign: 'center' },
  doneText: { fontSize: 21, fontWeight: '900', textAlign: 'center' },
  party: { fontSize: 24, fontWeight: '900' }
});
