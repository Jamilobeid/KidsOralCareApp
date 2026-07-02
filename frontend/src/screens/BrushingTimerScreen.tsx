import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { headingFont } from '../utils/kidStyle';

const totalSeconds = 120;
const steps = ['upperLeft', 'upperRight', 'lowerLeft', 'lowerRight', 'frontTeeth', 'tongue'];
const encouragements = [
  'Great!\nKeep Going!',
  'Sparkly smiles\nare coming!',
  'Brush like\na champion!',
  'Tiny circles,\nbig shine!',
  'You are doing\namazing!',
  'Almost there,\nsmile hero!'
];

const pasteToothImage = require('../../assets/images/brushing-tooth-paste.png');
const foamToothImage = require('../../assets/images/brushing-tooth-foam.png');
const shieldToothImage = require('../../assets/images/brushing-tooth-shield.png');
const originalMouthImage = require('../../assets/images/brushing-mouth-original.png');
const mouthImages = {
  upperLeft: require('../../assets/images/brushing-mouth-upper-left.png'),
  upperRight: require('../../assets/images/brushing-mouth-upper-right.png'),
  lowerLeft: require('../../assets/images/brushing-mouth-lower-left.png'),
  lowerRight: require('../../assets/images/brushing-mouth-lower-right.png'),
  frontTeeth: require('../../assets/images/brushing-mouth-front.png'),
  tongue: require('../../assets/images/brushing-mouth-tongue.png')
} as const;
const rewardStarImage = require('../../assets/images/brushing-reward-star.png');

export const BrushingTimerScreen = () => {
  const { t, completeBrushing } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);

  const elapsed = totalSeconds - secondsLeft;
  const hasStarted = elapsed > 0 || running;
  const progress = useMemo(() => elapsed / totalSeconds, [elapsed]);
  const stepIndex = Math.min(steps.length - 1, Math.floor(elapsed / (totalSeconds / steps.length)));
  const activeStep = steps[stepIndex];
  const message = elapsed < 20 ? '' : encouragements[Math.min(encouragements.length - 1, Math.floor(elapsed / 20) - 1)];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const currentMouthImage = hasStarted ? mouthImages[activeStep as keyof typeof mouthImages] : originalMouthImage;

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || completedRef.current) return;

    completedRef.current = true;
    setRunning(false);
    setFinished(true);
    completeBrushing();
  }, [completeBrushing, secondsLeft]);

  const resetTimer = () => {
    completedRef.current = false;
    setRunning(false);
    setFinished(false);
    setSecondsLeft(totalSeconds);
  };

  return (
    <LinearGradient colors={['#44D0C4', '#E4F8F5', '#FFFFFF']} locations={[0, 0.62, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topArea}>
            <View style={styles.titleBlock}>
              <Text style={[headingFont, styles.titleLeft]}>New Mission</Text>
              <Text style={[headingFont, styles.titleRight]}>Brush Time!</Text>
              <Text style={[headingFont, styles.subtitleLeft]}>Brush your teeth according to the teeth in the mouth below!</Text>
            </View>
            <View style={styles.toothRow}>
              <Image source={pasteToothImage} style={[styles.topTooth, styles.topToothOne]} resizeMode="contain" />
              <Image source={foamToothImage} style={[styles.topTooth, styles.topToothTwo]} resizeMode="contain" />
              <Image source={shieldToothImage} style={[styles.topTooth, styles.topToothThree]} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.mouthWrap}>
              <Image source={currentMouthImage} style={[styles.mouthImage, activeStep === 'tongue' && styles.tongueMouthImage]} resizeMode="contain" />
            </View>

            <View style={styles.timerRow}>
              <Text style={styles.timerPart}>{minutes}</Text>
              <Text style={styles.timerSeparator}>:</Text>
              <Text style={styles.timerPart}>{seconds}</Text>
            </View>
            <Text style={styles.encouragement}>{message}</Text>

            {hasStarted ? (
              <Text style={[headingFont, styles.instruction]}>{t(activeStep)}</Text>
            ) : (
              <View style={styles.startPrompt}>
                <Text style={[headingFont, styles.startPromptText]}>Start the Timer</Text>
                <Text style={styles.startArrow}>↓</Text>
              </View>
            )}

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
            </View>

            {finished ? <CelebrationCard /> : null}
          </View>

          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={running ? 'Pause timer' : 'Start timer'}
              onPress={() => {
                if (finished) return;
                setRunning((value) => !value);
              }}
              style={({ pressed }) => [styles.actionButton, styles.startButton, pressed && styles.pressed]}
            >
              <Text style={[headingFont, styles.startButtonText]}>{running ? 'Pause' : 'Start Timer'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset timer"
              onPress={resetTimer}
              style={({ pressed }) => [styles.actionButton, styles.resetButton, pressed && styles.pressed]}
            >
              <Text style={[headingFont, styles.resetButtonText]}>Reset Timer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const CelebrationCard = () => (
  <View style={styles.celebrationCard}>
    <Text style={styles.partyIcon}>🎉</Text>
    <Text style={[headingFont, styles.celebrationTitle]}>You did it!</Text>
    <Text style={[headingFont, styles.celebrationCopy]}>Two whole minutes of super brushing. Your teeth are sparkling!</Text>
    <View style={styles.celebrationStars}>
      <Image source={rewardStarImage} style={styles.celebrationStar} resizeMode="contain" />
      <Image source={rewardStarImage} style={styles.celebrationStar} resizeMode="contain" />
      <Image source={rewardStarImage} style={styles.celebrationStar} resizeMode="contain" />
    </View>
    <Text style={[headingFont, styles.celebrationReward]}>+20 SMILE STARS</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 98,
    paddingHorizontal: 10,
    paddingTop: 0
  },
  topArea: {
    minHeight: 196,
    position: 'relative'
  },
  titleBlock: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  },
  titleLeft: {
    color: '#050505',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 43
  },
  titleRight: {
    color: '#050505',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 43,
    marginLeft: 76,
    marginTop: -3,
    width: 265
  },
  subtitleLeft: {
    color: '#6F8184',
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 0,
    marginTop: 86,
    textAlign: 'center',
    width: '100%'
  },
  toothRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 92,
    top: 96
  },
  topTooth: {
    height: 53,
    width: 53
  },
  topToothOne: {
    marginTop: 1,
    marginRight: -4,
    transform: [{ rotate: '-7deg' }]
  },
  topToothTwo: {
    marginTop: 3,
    transform: [{ rotate: '5deg' }]
  },
  topToothThree: {
    marginTop: 8,
    transform: [{ rotate: '8deg' }]
  },
  panel: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#050505',
    borderRadius: 8,
    borderWidth: 4,
    minHeight: 510,
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 44
  },
  mouthWrap: {
    alignItems: 'center',
    height: 210,
    justifyContent: 'center',
    marginBottom: 18,
    width: 270
  },
  mouthImage: {
    height: 205,
    width: 255
  },
  tongueMouthImage: {
    transform: [{ translateX: 12 }]
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%'
  },
  timerPart: {
    color: '#050505',
    fontFamily: Platform.select({ ios: 'Arial', android: 'sans-serif-black', default: 'Arial' }),
    fontSize: 48,
    fontStyle: 'italic',
    fontWeight: '900',
    lineHeight: 58,
    minWidth: 76,
    textAlign: 'center'
  },
  timerSeparator: {
    color: '#050505',
    fontFamily: Platform.select({ ios: 'Arial', android: 'sans-serif-black', default: 'Arial' }),
    fontSize: 48,
    fontStyle: 'italic',
    fontWeight: '900',
    lineHeight: 58,
    marginHorizontal: 2,
    textAlign: 'center'
  },
  encouragement: {
    color: '#6F6F6F',
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center'
  },
  instruction: {
    color: '#050505',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 18,
    textAlign: 'center'
  },
  startPrompt: {
    alignItems: 'center',
    marginBottom: 7
  },
  startPromptText: {
    color: '#FF9F0A',
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center'
  },
  startArrow: {
    color: '#050505',
    fontSize: 56,
    lineHeight: 61,
    marginTop: 2
  },
  progressTrack: {
    backgroundColor: '#DDF8DD',
    borderRadius: 999,
    height: 19,
    overflow: 'hidden',
    width: '88%'
  },
  progressFill: {
    backgroundColor: '#54F160',
    borderRadius: 999,
    height: '100%'
  },
  celebrationCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FFE8F3',
    borderRadius: 22,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 16
  },
  partyIcon: {
    fontSize: 34,
    lineHeight: 40
  },
  celebrationTitle: {
    color: '#41438F',
    fontSize: 31,
    lineHeight: 38,
    marginTop: 2
  },
  celebrationCopy: {
    color: '#5D5794',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center'
  },
  celebrationStars: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  celebrationStar: {
    height: 34,
    width: 34
  },
  celebrationReward: {
    color: '#6155F6',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 10
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    height: 59,
    justifyContent: 'center'
  },
  startButton: {
    backgroundColor: '#6155F6'
  },
  resetButton: {
    backgroundColor: '#FF9F0A'
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 23
  },
  resetButtonText: {
    color: '#050505',
    fontSize: 17,
    lineHeight: 23
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  }
});
