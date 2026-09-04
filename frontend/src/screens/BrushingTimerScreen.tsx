import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { headingFont } from '../utils/kidStyle';

type BrushingStep = {
  image: ImageSourcePropType;
  instruction: string;
  duration: number | null;
  countsTowardBrushing: boolean;
};

const BRUSHING_SECONDS = 120;
const FIRST_BRUSHING_STEP = 4;
const LAST_BRUSHING_STEP = 11;

const brushingSteps: BrushingStep[] = [
  { image: require('../../assets/images/brushing-step-01.png'), instruction: 'Get ready for a healthy smile!', duration: null, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-02.png'), instruction: 'Put a pea-sized amount of toothpaste on your brush — enough to clean, but not too much.', duration: 15, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-after-toothpaste.png'), instruction: 'Open your mouth and get ready for the next brushing step.', duration: 3, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-03.png'), instruction: 'Close your mouth gently and get ready to brush.', duration: 10, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-04.png'), instruction: 'Brush the upper and lower teeth on the right side using gentle circles.', duration: 15, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-05.png'), instruction: 'Brush the front teeth using gentle circles.', duration: 10, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-06.png'), instruction: 'Brush the upper and lower teeth on the left side using gentle circles.', duration: 15, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-07.png'), instruction: 'Open your mouth wide so you can clean the inside surfaces.', duration: 5, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-08.png'), instruction: 'Brush the inside surfaces of the upper teeth with gentle up-and-down strokes.', duration: 20, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-09.png'), instruction: 'Brush the inside surfaces of the lower teeth with gentle up-and-down strokes.', duration: 20, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-10.png'), instruction: 'Brush every chewing surface with short back-and-forth strokes.', duration: 32, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-11.png'), instruction: 'Gently brush your tongue from back to front.', duration: 8, countsTowardBrushing: true },
  { image: require('../../assets/images/brushing-step-12.png'), instruction: 'Spit out the toothpaste when brushing is finished.', duration: 3, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-13.png'), instruction: "Do not rinse with water after brushing — let the toothpaste keep protecting your teeth.", duration: 6, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-14.png'), instruction: 'Floss gently between every tooth.', duration: 6, countsTowardBrushing: false },
  { image: require('../../assets/images/brushing-step-15.png'), instruction: 'Show off your clean and healthy smile!', duration: 3, countsTowardBrushing: false }
];

const rewardStarImage = require('../../assets/images/brushing-reward-star.png');
const toothpasteSignLanguageVideo = require('../../assets/videos/toothpaste-sign-language.mp4');
const letsBrushOurTeethSignLanguageVideo = require('../../assets/videos/lets-brush-our-teeth-sign-language.mp4');
const closeTeethSignLanguageVideo = require('../../assets/videos/close-teeth-sign-language.mp4');
const outsideTeethSignLanguageVideo = require('../../assets/videos/outside-teeth-sign-language.mp4');
const openMouthSignLanguageVideo = require('../../assets/videos/open-mouth-sign-language.mp4');
const insideUpperTeethSignLanguageVideo = require('../../assets/videos/inside-upper-teeth-sign-language.mp4');
const insideLowerTeethSignLanguageVideo = require('../../assets/videos/inside-lower-teeth-sign-language.mp4');
const chewingUpperTeethSignLanguageVideo = require('../../assets/videos/chewing-upper-teeth-sign-language.mp4');
const chewingLowerTeethSignLanguageVideo = require('../../assets/videos/chewing-lower-teeth-sign-language.mp4');
const brushTongueSignLanguageVideo = require('../../assets/videos/brush-tongue-sign-language.mp4');
const spitNoRinsingSignLanguageVideo = require('../../assets/videos/spit-no-rinsing-sign-language.mp4');
const flossingSignLanguageVideo = require('../../assets/videos/flossing-sign-language.mp4');
const cleanFinishSignLanguageVideo = require('../../assets/videos/clean-finish-sign-language.mp4');
const SIGN_LANGUAGE_STEPS = {
  1: {
    source: toothpasteSignLanguageVideo,
    captionKey: 'toothpasteSignLanguageCaption',
    accessibilityLabelKey: 'toothpasteSignLanguageVideo'
  },
  2: {
    source: letsBrushOurTeethSignLanguageVideo,
    captionKey: 'letsBrushSignLanguageCaption',
    accessibilityLabelKey: 'letsBrushSignLanguageVideo'
  },
  3: {
    source: closeTeethSignLanguageVideo,
    captionKey: 'closeTeethSignLanguageCaption',
    accessibilityLabelKey: 'closeTeethSignLanguageVideo'
  },
  4: {
    source: outsideTeethSignLanguageVideo,
    captionKey: 'outsideTeethSignLanguageCaption',
    accessibilityLabelKey: 'outsideTeethSignLanguageVideo'
  },
  5: {
    source: outsideTeethSignLanguageVideo,
    captionKey: 'outsideTeethSignLanguageCaption',
    accessibilityLabelKey: 'outsideTeethSignLanguageVideo'
  },
  6: {
    source: outsideTeethSignLanguageVideo,
    captionKey: 'outsideTeethSignLanguageCaption',
    accessibilityLabelKey: 'outsideTeethSignLanguageVideo'
  },
  7: {
    source: openMouthSignLanguageVideo,
    captionKey: 'openMouthSignLanguageCaption',
    accessibilityLabelKey: 'openMouthSignLanguageVideo'
  },
  8: {
    source: insideUpperTeethSignLanguageVideo,
    captionKey: 'insideUpperTeethSignLanguageCaption',
    accessibilityLabelKey: 'insideUpperTeethSignLanguageVideo'
  },
  9: {
    source: insideLowerTeethSignLanguageVideo,
    captionKey: 'insideLowerTeethSignLanguageCaption',
    accessibilityLabelKey: 'insideLowerTeethSignLanguageVideo'
  },
  10: {
    source: chewingUpperTeethSignLanguageVideo,
    captionKey: 'chewingUpperTeethSignLanguageCaption',
    secondarySource: chewingLowerTeethSignLanguageVideo,
    secondaryCaptionKey: 'chewingLowerTeethSignLanguageCaption',
    accessibilityLabelKey: 'chewingUpperTeethSignLanguageVideo',
    secondaryAccessibilityLabelKey: 'chewingLowerTeethSignLanguageVideo'
  },
  11: {
    source: brushTongueSignLanguageVideo,
    captionKey: 'brushTongueSignLanguageCaption',
    accessibilityLabelKey: 'brushTongueSignLanguageVideo'
  },
  12: {
    source: spitNoRinsingSignLanguageVideo,
    captionKey: 'spitNoRinsingSignLanguageCaption',
    accessibilityLabelKey: 'spitNoRinsingSignLanguageVideo'
  },
  13: {
    source: spitNoRinsingSignLanguageVideo,
    captionKey: 'spitNoRinsingSignLanguageCaption',
    accessibilityLabelKey: 'spitNoRinsingSignLanguageVideo'
  },
  14: {
    source: flossingSignLanguageVideo,
    captionKey: 'flossingSignLanguageCaption',
    accessibilityLabelKey: 'flossingSignLanguageVideo'
  },
  15: {
    source: cleanFinishSignLanguageVideo,
    captionKey: 'cleanFinishSignLanguageCaption',
    accessibilityLabelKey: 'cleanFinishSignLanguageVideo'
  }
} as const;

export const BrushingTimerScreen = () => {
  const { t, completeBrushing, brushedPeriodsToday, openedReminderPeriod, theme, brushingSignLanguageVideosEnabled } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const completedRef = useRef(false);
  const startedAtRef = useRef<Date | null>(null);
  const step = brushingSteps[stepIndex];
  const signLanguageStep = SIGN_LANGUAGE_STEPS[stepIndex as keyof typeof SIGN_LANGUAGE_STEPS];
  const useSecondarySignLanguageContent = Boolean(
    signLanguageStep && 'secondaryCaptionKey' in signLanguageStep
    && step.duration !== null && stepSecondsLeft <= step.duration / 2
  );
  const signLanguageCaptionKey = useSecondarySignLanguageContent && signLanguageStep && 'secondaryCaptionKey' in signLanguageStep
    ? signLanguageStep.secondaryCaptionKey
    : signLanguageStep?.captionKey;
  const signLanguageVideoSource = useSecondarySignLanguageContent && signLanguageStep && 'secondarySource' in signLanguageStep
    ? signLanguageStep.secondarySource
    : signLanguageStep?.source;
  const signLanguageAccessibilityLabelKey = useSecondarySignLanguageContent && signLanguageStep && 'secondaryAccessibilityLabelKey' in signLanguageStep
    ? signLanguageStep.secondaryAccessibilityLabelKey
    : signLanguageStep?.accessibilityLabelKey;
  const showSignLanguageVideo = brushingSignLanguageVideosEnabled && Boolean(signLanguageStep);

  const brushingSecondsLeft = useMemo(() => {
    if (stepIndex < FIRST_BRUSHING_STEP) return BRUSHING_SECONDS;
    if (stepIndex > LAST_BRUSHING_STEP) return 0;
    return brushingSteps.slice(stepIndex, LAST_BRUSHING_STEP + 1).reduce((total, item, index) => (
      total + (item.countsTowardBrushing ? (index === 0 ? stepSecondsLeft : item.duration ?? 0) : 0)
    ), 0);
  }, [stepIndex, stepSecondsLeft]);

  const brushingElapsed = BRUSHING_SECONDS - brushingSecondsLeft;
  const progress = Math.max(0, Math.min(1, brushingElapsed / BRUSHING_SECONDS));
  const showBrushingTimer = stepIndex <= LAST_BRUSHING_STEP && stepIndex !== 7;
  const minutes = Math.floor(brushingSecondsLeft / 60);
  const seconds = (brushingSecondsLeft % 60).toString().padStart(2, '0');

  useEffect(() => {
    if (!running || finished) return;
    const id = setTimeout(() => {
      if (stepSecondsLeft > 1) {
        setStepSecondsLeft((value) => value - 1);
        return;
      }

      if (stepIndex === brushingSteps.length - 1) {
        setRunning(false);
        setFinished(true);
        if (!completedRef.current) {
          completedRef.current = true;
          setRewardEarned(completeBrushing(startedAtRef.current ?? new Date()));
        }
        return;
      }

      const nextIndex = stepIndex + 1;
      if (nextIndex === FIRST_BRUSHING_STEP) startedAtRef.current = new Date();
      setStepIndex(nextIndex);
      setStepSecondsLeft(brushingSteps[nextIndex].duration ?? 0);
    }, 1000);
    return () => clearTimeout(id);
  }, [completeBrushing, finished, running, stepIndex, stepSecondsLeft]);

  const startOrPause = () => {
    if (finished) return;
    if (stepIndex === 0) {
      setStepIndex(1);
      setStepSecondsLeft(brushingSteps[1].duration ?? 0);
      setRunning(true);
      return;
    }
    setRunning((value) => !value);
  };

  const resetTimer = () => {
    completedRef.current = false;
    startedAtRef.current = null;
    setStepIndex(0);
    setStepSecondsLeft(0);
    setRunning(false);
    setFinished(false);
    setRewardEarned(false);
  };

  return (
    <LinearGradient colors={theme.gradient} locations={[0, 0.62, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {openedReminderPeriod && brushedPeriodsToday.includes(openedReminderPeriod) ? (
            <View accessibilityRole="alert" style={styles.completedReminderNotice}>
              <Text style={[headingFont, styles.completedReminderNoticeText]}>{t(openedReminderPeriod === 'morning' ? 'morningBrushComplete' : 'eveningBrushComplete')}</Text>
            </View>
          ) : null}

          <View style={styles.titleBlock}>
            <Text style={[headingFont, styles.brushPageTitle]}>{t('brushAction')}</Text>
            <Text style={[headingFont, styles.subtitle]}>{t('brushInstructionFull')}</Text>
          </View>

          <View style={styles.panel}>
            {showSignLanguageVideo ? (
              <View style={styles.signLanguageBlock}>
                <Video
                  key={signLanguageCaptionKey}
                  accessibilityLabel={signLanguageAccessibilityLabelKey ? t(signLanguageAccessibilityLabelKey) : undefined}
                  accessible
                  isLooping
                  isMuted
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={running}
                  source={signLanguageVideoSource}
                  style={styles.signLanguageVideo}
                  useNativeControls={false}
                />
                <Text accessibilityRole="text" style={[headingFont, styles.videoCaption]}>
                  {signLanguageCaptionKey ? t(signLanguageCaptionKey) : null}
                </Text>
              </View>
            ) : null}

            <View style={[styles.imageWrap, !showSignLanguageVideo && signLanguageStep && styles.imageWrapWithoutSignLanguageVideo]}>
              <Image source={step.image} style={[styles.stepImage, stepIndex === 9 && styles.lowerInnerTeethImage]} resizeMode="contain" />
            </View>

            {showBrushingTimer ? (
              <View style={styles.timerRow}>
                <Text style={styles.timerPart}>{minutes}</Text><Text style={styles.timerSeparator}>:</Text><Text style={styles.timerPart}>{seconds}</Text>
              </View>
            ) : <View style={styles.timerSpacer} />}

            {stepIndex === LAST_BRUSHING_STEP + 1 ? (
              <View style={styles.moreStepsMessage}>
                <Text style={[headingFont, styles.moreStepsMessageText]}>{t('moreBrushingSteps')}</Text>
              </View>
            ) : null}
            {!showSignLanguageVideo ? (
              <View style={[styles.instructionCard, signLanguageStep && styles.instructionCardWithoutSignLanguageVideo]}>
                <Text accessibilityRole="text" style={[headingFont, styles.instruction]}>
                  {signLanguageCaptionKey ? t(signLanguageCaptionKey) : step.instruction}
                </Text>
              </View>
            ) : null}
            {!finished && step.duration ? <Text style={styles.stepHint}>{step.countsTowardBrushing ? t('brushingTime') : t('secondsRemaining').replace('{{count}}', `${stepSecondsLeft}`)}</Text> : null}

            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} /></View>
            {finished ? <CelebrationCard rewardEarned={rewardEarned} t={t} /> : null}
          </View>

          <View style={styles.buttons}>
            <Pressable accessibilityRole="button" accessibilityLabel={running ? t('pauseTimer') : t('startTimerFull')} onPress={startOrPause} style={({ pressed }) => [styles.actionButton, styles.startButton, (finished || pressed) && styles.pressed]}>
              <Text style={[headingFont, styles.startButtonText]}>{running ? t('pauseTimer') : t('startTimerFull')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('resetTimer')} onPress={resetTimer} style={({ pressed }) => [styles.actionButton, styles.resetButton, pressed && styles.pressed]}>
              <Text style={[headingFont, styles.resetButtonText]}>{t('resetTimer')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const CelebrationCard = ({ rewardEarned, t }: { rewardEarned: boolean; t: (key: string) => string }) => (
  <View style={styles.celebrationCard}>
    <Text style={styles.partyIcon}>🎉</Text>
    <Text style={[headingFont, styles.celebrationTitle]}>{t('youDidIt')}</Text>
    <Text style={[headingFont, styles.celebrationCopy]}>{t('celebrationCopy')}</Text>
    {rewardEarned ? <><View style={styles.celebrationStars}>{[0, 1, 2].map((item) => <Image key={item} source={rewardStarImage} style={styles.celebrationStar} resizeMode="contain" />)}</View><Text style={[headingFont, styles.celebrationReward]}>{t('smileStarsReward')}</Text></> : null}
  </View>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 }, safe: { flex: 1 }, scrollContent: { paddingBottom: 115, paddingHorizontal: 10 },
  completedReminderNotice: { alignSelf: 'stretch', backgroundColor: '#FFF4C7', borderColor: '#F4CA56', borderRadius: 16, borderWidth: 1, marginBottom: 10, marginTop: 8, paddingHorizontal: 16, paddingVertical: 12 },
  completedReminderNoticeText: { color: '#765C13', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  titleBlock: { alignItems: 'center', paddingBottom: 16 }, brushPageTitle: { color: '#41438F', fontSize: 40, lineHeight: 46, marginTop: 14 },
  subtitle: { color: '#454F59', fontSize: 15, lineHeight: 22, marginTop: 6, textAlign: 'center' },
  panel: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, elevation: 3, gap: 10, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 16, shadowColor: '#17324D', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 9 },
  signLanguageBlock: { alignItems: 'center', alignSelf: 'stretch', gap: 10 },
  signLanguageVideo: { aspectRatio: 16 / 9, backgroundColor: '#EAF8F5', borderRadius: 20, width: '100%' },
  videoCaption: { color: '#192B32', fontSize: 18, lineHeight: 25, minHeight: 50, paddingHorizontal: 4, textAlign: 'center', width: '100%' },
  imageWrap: { alignItems: 'center', height: 260, justifyContent: 'center', width: '100%' }, stepImage: { height: '100%', width: '100%' },
  imageWrapWithoutSignLanguageVideo: { height: 330, marginTop: 4 },
  lowerInnerTeethImage: { transform: [{ scale: 1.35 }] },
  timerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }, timerSpacer: { height: 12 },
  timerPart: { color: '#050505', fontFamily: 'Fredoka_700Bold', fontSize: 50, lineHeight: 58, minWidth: 76, textAlign: 'center' },
  timerSeparator: { color: '#050505', fontFamily: 'Fredoka_700Bold', fontSize: 50, lineHeight: 58 },
  instructionCard: { alignItems: 'center', backgroundColor: '#F0FBF8', borderColor: '#CBEFE7', borderRadius: 20, borderWidth: 1, justifyContent: 'center', minHeight: 76, paddingHorizontal: 16, paddingVertical: 12, width: '100%' },
  instructionCardWithoutSignLanguageVideo: { backgroundColor: '#EAF8F5', borderColor: '#BFE8DE', marginTop: 2 },
  instruction: { color: '#192B32', fontSize: 21, lineHeight: 28, textAlign: 'center' }, stepHint: { color: '#7A8589', fontFamily: 'Fredoka_700Bold', fontSize: 14 },
  moreStepsMessage: { backgroundColor: '#FFF4C7', borderColor: '#F4CA56', borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, width: '100%' },
  moreStepsMessageText: { color: '#765C13', fontSize: 17, lineHeight: 23, textAlign: 'center' },
  progressTrack: { backgroundColor: '#DDF8DD', borderRadius: 999, height: 19, marginTop: 8, overflow: 'hidden', width: '88%' }, progressFill: { backgroundColor: '#54F160', borderRadius: 999, height: '100%' },
  celebrationCard: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#FFE8F3', borderRadius: 22, marginTop: 16, paddingHorizontal: 14, paddingVertical: 16 },
  partyIcon: { fontSize: 34, lineHeight: 40 }, celebrationTitle: { color: '#41438F', fontSize: 31, lineHeight: 38 }, celebrationCopy: { color: '#5D5794', fontSize: 13, lineHeight: 18, marginTop: 4, textAlign: 'center' },
  celebrationStars: { flexDirection: 'row', gap: 12, marginTop: 12 }, celebrationStar: { height: 34, width: 34 }, celebrationReward: { color: '#6155F6', fontSize: 15, lineHeight: 20, marginTop: 10 },
  buttons: { flexDirection: 'row', gap: 16, marginTop: 26 }, actionButton: { alignItems: 'center', borderRadius: 16, flex: 1, height: 59, justifyContent: 'center' },
  startButton: { backgroundColor: '#6155F6' }, resetButton: { backgroundColor: '#FF9F0A' }, startButtonText: { color: '#FFFFFF', fontSize: 17 }, resetButtonText: { color: '#050505', fontSize: 17 }, pressed: { opacity: 0.76 }
});
