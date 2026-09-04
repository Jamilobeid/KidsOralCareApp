import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { pictureQuestions } from '../data/pickTheRightOneQuestions';
import { getPickTheRightOneQuestionText } from '../data/pickTheRightOneQuestionText';
import { useApp } from '../context/AppContext';
import { getDailyPictureQuestions } from '../utils/dailyQuestions';
import { bodyFont, buttonFont, headingFont } from '../utils/kidStyle';

const correctMessageKeys = ['quickPickCorrect1', 'quickPickCorrect2', 'quickPickCorrect3', 'quickPickCorrect4'];
const tryAgainMessageKeys = ['quickPickTry1', 'quickPickTry2', 'quickPickTry3', 'quickPickTry4'];
const QUICK_PICK_REWARD = 10;
const instructionVideo = require('../../assets/videos/pick-right-one-instructions.mp4');
const trophyImage = require('../../assets/images/game-smile-race-trophy.png');
const rewardStarImage = require('../../assets/images/game-reward-star.png');
const instructionCaptions = {
  en: 'Choose the best one',
  fr: 'Choisis la meilleure option',
  ar: 'اختر الأفضل'
};

export const PickTheRightOneGame = ({ canPlayAgain, onComplete, onReplay, onStart }: { canPlayAgain: boolean; onComplete: () => void; onReplay: () => boolean; onStart: () => boolean }) => {
  const { language, t } = useApp();
  const [showInstructions, setShowInstructions] = useState(true);
  const dailyQuestions = useMemo(() => getDailyPictureQuestions(pictureQuestions), []);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [complete, setComplete] = useState(false);
  const inputLocked = useRef(false);
  const feedbackScale = useRef(new Animated.Value(0.96)).current;

  const replay = () => {
    if (!canPlayAgain || !onReplay()) return;
    setQuestionIndex(0);
    setSelectedChoiceId(null);
    setFeedback('');
    setComplete(false);
    inputLocked.current = false;
  };

  if (showInstructions) {
    return (
      <Card style={styles.instructionCard}>
        <Video
          accessibilityLabel={instructionCaptions[language]}
          isLooping
          isMuted
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          source={instructionVideo}
          style={styles.instructionVideo}
          useNativeControls={false}
        />
        <Text accessibilityRole="text" style={[headingFont, styles.videoCaption]}>
          {instructionCaptions[language]}
        </Text>
        <View style={styles.instructionButton}>
          <AppButton label={t('play')} onPress={() => { if (onStart()) setShowInstructions(false); }} />
        </View>
      </Card>
    );
  }

  if (dailyQuestions.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons name="images" size={42} color="#6552EB" />
        </View>
        <Text style={[headingFont, styles.emptyTitle]}>{t('picturesComingSoon')}</Text>
        <Text style={[bodyFont, styles.emptyText]}>{t('pictureQuestionsPreparing')}</Text>
      </Card>
    );
  }

  const question = dailyQuestions[questionIndex];
  const isCorrect = selectedChoiceId === question.correctChoiceId;

  const choose = (choiceId: string) => {
    if (inputLocked.current || selectedChoiceId !== null) return;
    inputLocked.current = true;
    const correct = choiceId === question.correctChoiceId;
    const messageKeys = correct ? correctMessageKeys : tryAgainMessageKeys;
    const messageIndex = Math.abs(question.id.length + questionIndex + choiceId.length) % messageKeys.length;
    setSelectedChoiceId(choiceId);
    setFeedback(t(messageKeys[messageIndex]));
    feedbackScale.setValue(0.96);
    Animated.spring(feedbackScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }).start();
  };

  const next = () => {
    if (selectedChoiceId === null) return;
    if (!isCorrect) {
      setSelectedChoiceId(null);
      setFeedback('');
      inputLocked.current = false;
      return;
    }
    if (questionIndex === dailyQuestions.length - 1) {
      setComplete(true);
      onComplete();
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedChoiceId(null);
    setFeedback('');
    inputLocked.current = false;
  };

  if (complete) {
    return (
      <Card style={styles.completeCard}>
        <Image source={trophyImage} style={styles.completeTrophy} resizeMode="contain" />
        <Text style={[headingFont, styles.completeTitle]}>{t('quickPickChamp')}</Text>
        <View style={styles.finalScore}>
          <Text style={[headingFont, styles.finalScoreLabel]}>{t('finalScore')}</Text>
          <Text style={[headingFont, styles.finalScoreValue]}>{dailyQuestions.length} / {dailyQuestions.length}</Text>
        </View>
        <View style={styles.rewardPill}>
          <Image source={rewardStarImage} style={styles.rewardStar} resizeMode="contain" />
          <Text style={[headingFont, styles.rewardValue]}>+{QUICK_PICK_REWARD}</Text>
        </View>
        {canPlayAgain ? <AppButton label={t('playAgain')} onPress={replay} /> : <Text style={[bodyFont, styles.noTriesText]}>{t('comeBackTomorrow')}</Text>}
      </Card>
    );
  }

  return (
    <Card style={styles.gameCard}>
      <Text style={[buttonFont, styles.progress]}>{t('questionProgress').replace('{{current}}', `${questionIndex + 1}`).replace('{{total}}', `${dailyQuestions.length}`)}</Text>
      <Text style={[headingFont, styles.question]}>
        {getPickTheRightOneQuestionText(question.id, language, question.question)}
      </Text>
      <View style={styles.choiceRow}>
        {question.choices.map((choice) => {
          const selected = selectedChoiceId === choice.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('answerOption').replace('{{number}}', `${question.choices.indexOf(choice) + 1}`)}
              disabled={selectedChoiceId !== null}
              key={choice.id}
              onPress={() => choose(choice.id)}
              style={({ pressed }) => [
                styles.choice,
                question.choices.length === 2 ? styles.twoChoice : styles.threeChoice,
                selected && (isCorrect ? styles.correctChoice : styles.incorrectChoice),
                pressed && styles.pressed
              ]}
            >
              <Image source={choice.image} style={styles.choiceImage} resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
      {selectedChoiceId !== null ? (
        <Animated.View style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.incorrectFeedback, { transform: [{ scale: feedbackScale }] }]}>
          <Ionicons name={isCorrect ? 'checkmark-circle' : 'heart'} size={22} color={isCorrect ? '#168954' : '#C8447C'} />
          <View style={styles.feedbackCopy}>
            <Text style={[buttonFont, styles.feedbackText, { color: isCorrect ? '#168954' : '#C8447C' }]}>{feedback}</Text>
            {!isCorrect ? <Text style={[bodyFont, styles.explanation]}>{t('quickPickIncorrectExplanation')}</Text> : null}
          </View>
        </Animated.View>
      ) : null}
      {selectedChoiceId !== null ? <AppButton label={isCorrect ? (questionIndex === dailyQuestions.length - 1 ? t('finish') : t('next')) : t('tryAgain')} onPress={next} /> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  instructionCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 10 },
  instructionVideo: { aspectRatio: 16 / 9, backgroundColor: '#EAF8F5', borderRadius: 20, width: '100%' },
  videoCaption: { color: '#192B32', fontSize: 18, lineHeight: 25, minHeight: 50, paddingHorizontal: 4, textAlign: 'center', width: '100%' },
  instructionButton: { width: '100%' },
  gameCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 14, elevation: 3 },
  progress: { color: '#168954', fontSize: 14 },
  question: { color: '#17324D', fontSize: 22, lineHeight: 29, textAlign: 'center' },
  choiceRow: { alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  choice: { alignItems: 'center', aspectRatio: 0.82, backgroundColor: '#FEFEFE', borderColor: '#DDE9EA', borderRadius: 22, borderWidth: 3, justifyContent: 'center', padding: 8 },
  twoChoice: { flexBasis: '45%', maxWidth: 180 },
  threeChoice: { flexBasis: '30%', maxWidth: 130 },
  choiceImage: { flex: 1, minHeight: 80, width: '100%' },
  correctChoice: { backgroundColor: '#FEFEFE', borderColor: '#31C778' },
  incorrectChoice: { backgroundColor: '#FEFEFE', borderColor: '#E85B78' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  feedback: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', gap: 7, paddingHorizontal: 15, paddingVertical: 9, width: '100%' },
  feedbackCopy: { flex: 1 },
  correctFeedback: { backgroundColor: '#E9FFF4' },
  incorrectFeedback: { backgroundColor: '#FFEAF2' },
  feedbackText: { fontSize: 16, lineHeight: 21 },
  explanation: { color: '#536B73', fontSize: 13, lineHeight: 18 },
  emptyCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 14, paddingVertical: 32 },
  emptyIcon: { alignItems: 'center', backgroundColor: '#F0ECFF', borderRadius: 30, height: 92, justifyContent: 'center', width: 92 },
  emptyTitle: { color: '#41438F', fontSize: 27, lineHeight: 34, textAlign: 'center' },
  emptyText: { color: '#536B73', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  completeCard: { alignItems: 'center', backgroundColor: '#F7FFFC', borderRadius: 28, borderWidth: 0, gap: 14, padding: 24 },
  completeTrophy: { height: 210, width: '100%' },
  completeTitle: { color: '#41438F', fontSize: 29, lineHeight: 40, textAlign: 'center' },
  finalScore: { alignItems: 'center', backgroundColor: '#E9FFF8', borderRadius: 22, minWidth: 180, padding: 14 },
  finalScoreLabel: { color: '#168954', fontSize: 12, letterSpacing: 1 },
  finalScoreValue: { color: '#173D3B', fontSize: 25 },
  rewardPill: { alignItems: 'center', backgroundColor: '#E8ECEB', borderRadius: 999, flexDirection: 'row', gap: 5, paddingHorizontal: 13, paddingVertical: 7 },
  rewardStar: { height: 34, width: 34 },
  rewardValue: { color: '#171B1B', fontSize: 20, lineHeight: 25 },
  noTriesText: { color: '#607A80', fontSize: 14, lineHeight: 20, textAlign: 'center' }
});
