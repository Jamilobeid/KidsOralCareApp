import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { Game } from '../types/app';
import { bodyFont, buttonFont, headingFont, rewardFont } from '../utils/kidStyle';

type IconSpec = { icon?: keyof typeof Ionicons.glyphMap; image?: ImageSourcePropType; color: string; background: string };
type TargetSpec = IconSpec & { label: string };
type QuizQuestion = { question: string; choices: TargetSpec[]; answer: number };
type ToothChoice = { image: ImageSourcePropType; clean: boolean; label: string };
type FoodChoice = { image: ImageSourcePropType; healthy: boolean; label: string };
type SugarProduct = { name: string; sugarGrams: number; image: ImageSourcePropType };

const strongToothChoices: ToothChoice[] = [
  { image: require('../../assets/images/game-strong-clean.png'), clean: true, label: 'Clean tooth' },
  { image: require('../../assets/images/game-strong-bad-1.png'), clean: false, label: 'Plaque tooth' },
  { image: require('../../assets/images/game-strong-bad-2.png'), clean: false, label: 'Sugary tooth' },
  { image: require('../../assets/images/game-strong-bad-3.png'), clean: false, label: 'Stained tooth' }
];

const strongToothRounds = [
  [0, 1, 2, 3],
  [2, 0, 3, 1],
  [1, 3, 0, 2],
  [3, 2, 1, 0]
];

const healthyPickChoices: FoodChoice[] = [
  { image: require('../../assets/images/game-healthy-broccoli.png'), healthy: true, label: 'Broccoli' },
  { image: require('../../assets/images/game-healthy-apple.png'), healthy: true, label: 'Apple' },
  { image: require('../../assets/images/game-healthy-milk.png'), healthy: true, label: 'Milk' },
  { image: require('../../assets/images/game-healthy-carrot.png'), healthy: true, label: 'Carrot' },
  { image: require('../../assets/images/game-healthy-yogurt.png'), healthy: true, label: 'Yogurt' },
  { image: require('../../assets/images/game-treat-donut.png'), healthy: false, label: 'Donut' },
  { image: require('../../assets/images/game-treat-cookie.png'), healthy: false, label: 'Cookie' },
  { image: require('../../assets/images/game-treat-lollipop.png'), healthy: false, label: 'Lollipop' },
  { image: require('../../assets/images/game-treat-candy.png'), healthy: false, label: 'Candy' },
  { image: require('../../assets/images/game-treat-cupcake.png'), healthy: false, label: 'Cupcake' }
];

const healthyPickRounds = [
  [0, 5, 6, 7],
  [8, 1, 9, 5],
  [6, 7, 2, 9],
  [3, 8, 5, 6]
];

// Local-only game content for now; this can later come from a rewards/content API.
const sugarProducts: SugarProduct[] = [
  { name: 'Gummy Bear', sugarGrams: 18, image: require('../../assets/images/game-sugar-gummy-bear.png') },
  { name: 'MilkShake', sugarGrams: 20, image: require('../../assets/images/game-sugar-milkshake.png') },
  { name: 'Donut', sugarGrams: 24, image: require('../../assets/images/game-sugar-donut.png') },
  { name: 'Cake-Slice', sugarGrams: 12, image: require('../../assets/images/game-sugar-cake-slice.png') },
  { name: 'Chocolate Bar', sugarGrams: 40, image: require('../../assets/images/game-sugar-chocolate-bar.png') },
  { name: 'Cheese Cube', sugarGrams: 18, image: require('../../assets/images/game-sugar-cheese-cube.png') },
  { name: 'Ice Cream', sugarGrams: 28, image: require('../../assets/images/game-sugar-ice-cream.png') },
  { name: 'Marshmallow', sugarGrams: 14, image: require('../../assets/images/game-sugar-marshmallow.png') }
];

const gameIcons: Record<string, IconSpec> = {
  'plaque-pop': { image: require('../../assets/images/game-strong-tooth-icon.png'), color: '#1D9BF0', background: '#FFFFFF' },
  'food-sorter': { image: require('../../assets/images/game-healthy-lunchbox.png'), color: '#20B46B', background: '#FFFFFF' },
  'sugar-detective': { image: require('../../assets/images/game-sugar-detective.png'), color: '#1D9BF0', background: '#FFFFFF' },
  'brush-sequence': { icon: 'brush', color: '#FF9F1C', background: '#FFF4D8' },
  'clean-tooth': { image: require('../../assets/images/game-rescue-icon.png'), color: '#2BBBAD', background: '#FFFFFF' },
  'smile-quiz': { image: require('../../assets/images/game-genius-icon.png'), color: '#7B61FF', background: '#FFFFFF' }
};

const targetSets: Record<string, TargetSpec[]> = {
  'food-sorter': [
    { label: 'Veggie', icon: 'leaf', color: '#20B46B', background: '#E9FFF4' },
    { label: 'Candy', icon: 'alert-circle', color: '#FF5C8A', background: '#FFEAF2' },
    { label: 'Carrot', icon: 'nutrition', color: '#FF9F1C', background: '#FFF4D8' },
    { label: 'Sweets', icon: 'close-circle', color: '#FF5C8A', background: '#FFEAF2' }
  ],
  'sugar-detective': [
    { label: 'Candy', icon: 'search', color: '#FF5C8A', background: '#FFEAF2' },
    { label: 'Drink', icon: 'cafe', color: '#7B61FF', background: '#F0ECFF' },
    { label: 'Cookie', icon: 'fast-food', color: '#C8793B', background: '#FFF0E2' },
    { label: 'Water', icon: 'water', color: '#1D9BF0', background: '#EAF7FF' }
  ],
  'brush-sequence': [
    { label: 'Brush', icon: 'brush', color: '#FF9F1C', background: '#FFF4D8' },
    { label: 'Teeth', icon: 'happy', color: '#2BBBAD', background: '#E8FBF5' },
    { label: 'Rinse', icon: 'water', color: '#1D9BF0', background: '#EAF7FF' },
    { label: 'Shine', icon: 'sparkles', color: '#1D9BF0', background: '#EAF7FF' }
  ]
};

const cleanItems: TargetSpec[] = [
  { label: 'Germ', image: require('../../assets/images/game-rescue-germ.png'), icon: 'bug', color: '#35B779', background: '#E9FFF4' },
  { label: 'Chocolate', image: require('../../assets/images/game-rescue-chocolate.png'), icon: 'square', color: '#8B5A2B', background: '#FFF0E2' },
  { label: 'Candy', image: require('../../assets/images/game-rescue-candy.png'), icon: 'alert-circle', color: '#FF5C8A', background: '#FFEAF2' },
  { label: 'Cavity germ', image: require('../../assets/images/game-rescue-germ.png'), icon: 'bug', color: '#35B779', background: '#E9FFF4' },
  { label: 'Yellow plaque', image: require('../../assets/images/game-rescue-plaque.png'), icon: 'ellipse', color: '#E0A800', background: '#FFF4C7' },
  { label: 'Plaque', image: require('../../assets/images/game-rescue-plaque.png'), icon: 'ellipse', color: '#E0A800', background: '#FFF4C7' }
];

const rewardTrophyImage = require('../../assets/images/game-reward-trophy.png');
const rewardStarImage = require('../../assets/images/game-reward-star.png');
const retryIconImage = require('../../assets/images/game-retry-icon.png');

const quizQuestions: QuizQuestion[] = [
  { question: 'How many times a day should you brush?', choices: [{ label: '1 time', image: require('../../assets/images/game-genius-one.png'), icon: 'keypad', color: '#5AA5F5', background: '#EAF4FF' }, { label: '2 times', image: require('../../assets/images/game-genius-two.png'), icon: 'checkmark', color: '#31C778', background: '#E9FFF4' }, { label: 'Never', image: require('../../assets/images/game-genius-no.png'), icon: 'ban', color: '#FF5C8A', background: '#FFEAF2' }], answer: 1 },
  { question: 'How long is a good brushing?', choices: [{ label: '10 seconds', image: require('../../assets/images/game-genius-lightning.png'), icon: 'flash', color: '#FF7A3D', background: '#FFF0E2' }, { label: '2 minutes', image: require('../../assets/images/game-genius-alarm.png'), icon: 'timer', color: '#FF5C8A', background: '#FFEAF2' }, { label: '1 hour', image: require('../../assets/images/game-genius-clock.png'), icon: 'time', color: '#6D7480', background: '#F1F4F7' }], answer: 1 },
  { question: 'Which food is a friend to your teeth?', choices: [{ label: 'Candy', image: require('../../assets/images/game-genius-candy.png'), icon: 'alert-circle', color: '#FF5C8A', background: '#FFEAF2' }, { label: 'Carrot', image: require('../../assets/images/game-genius-carrot.png'), icon: 'nutrition', color: '#FF9F1C', background: '#FFF4D8' }, { label: 'Lollipop', image: require('../../assets/images/game-genius-lollipop.png'), icon: 'close-circle', color: '#FF5C8A', background: '#FFEAF2' }], answer: 1 },
  { question: 'When should you change your toothbrush?', choices: [{ label: 'Every 3 months', image: require('../../assets/images/game-genius-calendar-3m.png'), icon: 'calendar', color: '#7B61FF', background: '#F0ECFF' }, { label: 'Every day', image: require('../../assets/images/game-genius-calendar-day.png'), icon: 'today', color: '#1D9BF0', background: '#EAF7FF' }, { label: 'Never', image: require('../../assets/images/game-genius-never.png'), icon: 'infinite', color: '#6D8BFF', background: '#EEF2FF' }], answer: 0 },
  { question: 'What drink helps make teeth strong?', choices: [{ label: 'Soda', image: require('../../assets/images/game-genius-soda.png'), icon: 'cafe', color: '#FF5C8A', background: '#FFEAF2' }, { label: 'Milk', image: require('../../assets/images/game-genius-milk.png'), icon: 'water', color: '#8EC5FF', background: '#EAF7FF' }, { label: 'Sugary juice', image: require('../../assets/images/game-genius-juice.png'), icon: 'cube', color: '#35B779', background: '#E9FFF4' }], answer: 1 }
];

const IconBubble = ({ spec, size = 48 }: { spec: IconSpec; size?: number }) => (
  <View style={[styles.iconBubble, { width: size, height: size, borderRadius: size / 3, backgroundColor: spec.background }]}>
    {spec.image ? <Image source={spec.image} style={[styles.iconImage, { width: Math.round(size * 0.8), height: Math.round(size * 0.8) }]} resizeMode="contain" /> : <Ionicons name={spec.icon} size={Math.round(size * 0.52)} color={spec.color} />}
  </View>
);

const GameHeader = ({ game, onBack }: { game: Game; onBack: () => void }) => {
  const { t } = useApp();
  return (
    <View style={styles.gameHeader}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#17324D" />
        <Text style={[buttonFont, styles.backText]}>{t('games')}</Text>
      </Pressable>
      <View style={styles.focusTitleRow}>
        <IconBubble spec={gameIcons[game.id] ?? gameIcons['plaque-pop']} size={game.id === 'clean-tooth' ? 78 : 60} />
        <View style={styles.focusTitleCopy}>
          <Text style={styles.focusGameTitle}>{game.titleKey ? t(game.titleKey) : t('games')}</Text>
        </View>
      </View>
    </View>
  );
};

const LimitReachedNote = () => {
  const { t } = useApp();
  return <Text style={[bodyFont, styles.resultLimitText]}>{t('comeBackTomorrowPlay')}</Text>;
};

const GameWinResult = ({ message, points, canPlayAgain, onPlayAgain }: { message: string; points: number; canPlayAgain: boolean; onPlayAgain: () => void }) => {
  const { t } = useApp();
  return (
    <Card style={[styles.gamePanelBorder, styles.winResultCard]}>
      <Image source={rewardTrophyImage} style={styles.winTrophyImage} resizeMode="contain" />
      <Text style={styles.winResultTitle}>{t('congratulations')}</Text>
      <Text style={styles.winResultMessage}>{message}</Text>
      <View style={styles.resultRewardRow}>
        <Text style={styles.resultRewardText}>+{points}</Text>
        <Image source={rewardStarImage} style={styles.resultStarImage} resizeMode="contain" />
      </View>
      {canPlayAgain ? <AppButton label={t('playAgain')} onPress={onPlayAgain} style={styles.winPlayAgainButton} /> : <LimitReachedNote />}
    </Card>
  );
};

const StrongToothGame = ({ canPlayAgain, onReplay, onWin }: { canPlayAgain: boolean; onReplay: () => boolean; onWin: () => void }) => {
  const { theme, t } = useApp();
  const [selected, setSelected] = useState<number | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const roundChoices = strongToothRounds[roundIndex].map((index) => strongToothChoices[index]);
  const selectedChoice = selected === null ? null : roundChoices[selected];
  const won = correctCount > 2;

  const choose = (choice: ToothChoice, index: number) => {
    if (selected !== null || complete) return;
    setSelected(index);
    if (choice.clean) setCorrectCount((value) => value + 1);
  };

  const goNext = () => {
    if (selected === null) return;
    const nextCorrectCount = correctCount;
    if (roundIndex === strongToothRounds.length - 1) {
      const didWin = nextCorrectCount > 2;
      setComplete(true);
      if (didWin && !awarded) {
        setAwarded(true);
        onWin();
      }
      return;
    }
    setRoundIndex((value) => value + 1);
    setSelected(null);
  };

  const tryAgain = () => {
    if (!onReplay()) return;
    setSelected(null);
    setRoundIndex(0);
    setCorrectCount(0);
    setComplete(false);
    setAwarded(false);
  };

  if (complete) {
    if (won) {
      return (
        <GameWinResult
          message={t('strongFound').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${strongToothRounds.length}`)}
          points={15}
          canPlayAgain={canPlayAgain}
          onPlayAgain={tryAgain}
        />
      );
    }

    return (
      <Card style={[styles.gamePanelBorder, styles.strongCard]}>
        <View style={[styles.resultBadge, styles.retryBadge]}>
          <Image source={retryIconImage} style={styles.retryIconImage} resizeMode="contain" />
        </View>
        <Text style={[headingFont, styles.resultTitle, { color: '#C8447C' }]}>{t('tryAgainGame')}</Text>
        <Text style={[buttonFont, styles.resultText, { color: theme.text }]}>
          {t('strongFound').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${strongToothRounds.length}`)}
        </Text>
        <Text style={[rewardFont, styles.score, { color: '#C8447C' }]}>{t('scoreToWin34')}</Text>
        {canPlayAgain ? <AppButton label={t('tryAgainGame')} onPress={tryAgain} /> : <LimitReachedNote />}
      </Card>
    );
  }

  return (
    <Card style={[styles.gamePanelBorder, styles.strongCard]}>
      <Text style={[buttonFont, styles.playTitle, { color: theme.text }]}>{t('gamePlaquePopDesc')}</Text>
      <View style={styles.roundProgressShell}>
        <View style={[styles.roundProgressFill, { width: `${(roundIndex / strongToothRounds.length) * 100}%`, backgroundColor: theme.primary }]} />
      </View>
      <Text style={[buttonFont, styles.roundText, { color: theme.text }]}>{t('round')} {roundIndex + 1} / {strongToothRounds.length}</Text>
      <View style={styles.toothChoiceGrid}>
        {roundChoices.map((choice, index) => {
          const chosen = selected === index;
          return (
            <Pressable key={choice.label} onPress={() => choose(choice, index)} style={[styles.toothChoice, chosen ? (choice.clean ? styles.toothChoiceCorrect : styles.toothChoiceWrong) : undefined]}>
              <Image source={choice.image} style={styles.toothChoiceImage} resizeMode="contain" />
              {chosen ? <Ionicons name={choice.clean ? 'checkmark-circle' : 'close-circle'} size={28} color={choice.clean ? '#31C778' : '#FF5C8A'} style={styles.choiceBadge} /> : null}
            </Pressable>
          );
        })}
      </View>
      {selectedChoice ? <Text style={[buttonFont, styles.feedback, { color: selectedChoice.clean ? '#168954' : '#C8447C' }]}>{selectedChoice.clean ? t('strongFeedbackGood') : t('strongFeedbackBad')}</Text> : null}
      <Text style={[rewardFont, styles.score, { color: theme.primary }]}>{t('score')}: {correctCount}</Text>
      {selected !== null ? <AppButton label={roundIndex === strongToothRounds.length - 1 ? t('seeResult') : t('nextRound')} onPress={goNext} /> : null}
    </Card>
  );
};

const HealthyPicksGame = ({ canPlayAgain, onReplay, onWin }: { canPlayAgain: boolean; onReplay: () => boolean; onWin: () => void }) => {
  const { theme, t } = useApp();
  const [selected, setSelected] = useState<number | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const roundChoices = healthyPickRounds[roundIndex].map((index) => healthyPickChoices[index]);
  const selectedChoice = selected === null ? null : roundChoices[selected];
  const won = correctCount > 2;

  const choose = (choice: FoodChoice, index: number) => {
    if (selected !== null || complete) return;
    setSelected(index);
    if (choice.healthy) setCorrectCount((value) => value + 1);
  };

  const goNext = () => {
    if (selected === null) return;
    if (roundIndex === healthyPickRounds.length - 1) {
      const didWin = correctCount > 2;
      setComplete(true);
      if (didWin && !awarded) {
        setAwarded(true);
        onWin();
      }
      return;
    }
    setRoundIndex((value) => value + 1);
    setSelected(null);
  };

  const tryAgain = () => {
    if (!onReplay()) return;
    setSelected(null);
    setRoundIndex(0);
    setCorrectCount(0);
    setComplete(false);
    setAwarded(false);
  };

  if (complete) {
    if (won) {
      return (
        <GameWinResult
          message={t('healthyPicked').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${healthyPickRounds.length}`)}
          points={20}
          canPlayAgain={canPlayAgain}
          onPlayAgain={tryAgain}
        />
      );
    }

    return (
      <Card style={[styles.gamePanelBorder, styles.healthyCard]}>
        <View style={[styles.resultBadge, styles.retryBadge]}>
          <Image source={retryIconImage} style={styles.retryIconImage} resizeMode="contain" />
        </View>
        <Text style={[headingFont, styles.resultTitle, { color: '#C8447C' }]}>{t('tryAgainGame')}</Text>
        <Text style={[buttonFont, styles.resultText, { color: theme.text }]}>
          {t('healthyPicked').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${healthyPickRounds.length}`)}
        </Text>
        <Text style={[rewardFont, styles.score, { color: '#C8447C' }]}>{t('scoreToWin34')}</Text>
        {canPlayAgain ? <AppButton label={t('tryAgainGame')} onPress={tryAgain} /> : <LimitReachedNote />}
      </Card>
    );
  }

  return (
    <Card style={[styles.gamePanelBorder, styles.healthyCard]}>
      <Text style={[buttonFont, styles.playTitle, { color: theme.text }]}>{t('pickHealthySnack')}</Text>
      <View style={styles.roundProgressShell}>
        <View style={[styles.roundProgressFill, { width: `${(roundIndex / healthyPickRounds.length) * 100}%`, backgroundColor: theme.primary }]} />
      </View>
      <Text style={[buttonFont, styles.roundText, { color: theme.text }]}>{t('round')} {roundIndex + 1} / {healthyPickRounds.length}</Text>
      <View style={styles.foodChoiceGrid}>
        {roundChoices.map((choice, index) => {
          const chosen = selected === index;
          return (
            <Pressable key={choice.label} onPress={() => choose(choice, index)} style={[styles.foodChoice, chosen ? (choice.healthy ? styles.foodChoiceCorrect : styles.foodChoiceWrong) : undefined]}>
              <Image source={choice.image} style={styles.foodChoiceImage} resizeMode="contain" />
              <Text style={[buttonFont, styles.foodChoiceLabel, { color: theme.text }]}>{choice.label}</Text>
              {chosen ? <Ionicons name={choice.healthy ? 'checkmark-circle' : 'close-circle'} size={28} color={choice.healthy ? '#31C778' : '#FF5C8A'} style={styles.choiceBadge} /> : null}
            </Pressable>
          );
        })}
      </View>
      {selectedChoice ? <Text style={[buttonFont, styles.feedback, { color: selectedChoice.healthy ? '#168954' : '#C8447C' }]}>{selectedChoice.healthy ? t('healthyFeedbackGood') : t('healthyFeedbackBad')}</Text> : null}
      <Text style={[styles.score, { color: theme.primary }]}>{t('score')}: {correctCount}</Text>
      {selected !== null ? <AppButton label={roundIndex === healthyPickRounds.length - 1 ? t('seeResult') : t('nextRound')} onPress={goNext} /> : null}
    </Card>
  );
};

const GenericGame = ({ game, score, onScore }: { game: Game; score: number; onScore: () => void }) => {
  const { t, theme } = useApp();
  const targets = targetSets[game.id] ?? targetSets['brush-sequence'];

  return (
    <Card style={[styles.gamePanelBorder, styles.focusCard]}>
      <Text style={[buttonFont, styles.playTitle, { color: theme.text }]}>{t('tapCorrectItems')}</Text>
      <View style={styles.largeTargetGrid}>
        {targets.map((item, index) => (
          <Pressable key={`${item.label}-${index}`} onPress={onScore} style={[styles.largeTarget, { backgroundColor: item.background }]}>
            <Ionicons name={item.icon} size={34} color={item.color} />
            <Text style={[buttonFont, styles.targetLabel, { color: theme.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[rewardFont, styles.score, { color: theme.primary }]}>{t('score')}: {score}</Text>
    </Card>
  );
};

const getSugarCubeAnswer = (grams: number) => Math.round(grams / 4);

const getSugarOptions = (answer: number) => {
  const candidates = [answer, Math.max(1, answer - 2), Math.max(1, answer - 1), answer + 1, answer + 2];
  return Array.from(new Set(candidates)).slice(0, 4).sort((a, b) => a - b);
};

const SugarDetectiveGame = ({ canPlayAgain, onReplay, onComplete }: { canPlayAgain: boolean; onReplay: () => boolean; onComplete: () => void }) => {
  const { theme, t } = useApp();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const bounce = useState(() => new Animated.Value(1))[0];
  const product = sugarProducts[questionIndex];
  const answer = getSugarCubeAnswer(product.sugarGrams);
  const options = getSugarOptions(answer);
  const starsEarned = score * 3;

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const chooseAnswer = (choice: number) => {
    if (selected === answer) return;
    setSelected(choice);
    animateCard();
    if (choice !== answer) {
      setMessage(t('sugarTryAgain'));
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    setMessage(t('sugarSolved'));

    setTimeout(() => {
      if (questionIndex === sugarProducts.length - 1) {
        setComplete(true);
        if (!awarded) {
          setAwarded(true);
          onComplete();
        }
        return;
      }
      setQuestionIndex((value) => value + 1);
      setSelected(null);
      setMessage('');
    }, 850);
  };

  const restart = () => {
    if (!onReplay()) return;
    setQuestionIndex(0);
    setScore(0);
    setSelected(null);
    setMessage('');
    setComplete(false);
    setAwarded(false);
  };

  if (complete) {
    return (
      <GameWinResult
        message={`You solved ${score} out of ${sugarProducts.length} sugar clues.`}
        points={starsEarned}
        canPlayAgain={canPlayAgain}
        onPlayAgain={restart}
      />
    );
  }

  return (
    <Card style={[styles.gamePanelBorder, styles.sugarCard]}>
      <View style={styles.sugarTopRow}>
        <Text style={[rewardFont, styles.sugarScore, { color: theme.primary }]}>Score: {score}</Text>
      </View>
      <Text style={[buttonFont, styles.sugarRule]}>1 sugar cube = 4 grams of sugar</Text>
      <View style={styles.quizProgressShell}>
        <View style={[styles.quizProgressFill, { width: `${(questionIndex / sugarProducts.length) * 100}%` }]} />
      </View>
      <Text style={[buttonFont, styles.quizSubtitle]}>Question {questionIndex + 1} / {sugarProducts.length}</Text>

      <Animated.View style={[styles.productCard, { transform: [{ scale: bounce }] }]}>
        <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        <View style={styles.productCopy}>
          <Text style={[headingFont, styles.productName, { color: theme.text }]}>{product.name}</Text>
          <Text style={[rewardFont, styles.sugarGrams]}>{product.sugarGrams}g sugar</Text>
        </View>
      </Animated.View>

      <Text style={[buttonFont, styles.sugarQuestion, { color: theme.text }]}>How many sugar cubes are hiding inside?</Text>
      <View style={styles.sugarOptions}>
        {options.map((choice) => {
          const isSelected = selected === choice;
          const isCorrect = choice === answer;
          return (
            <Pressable
              key={choice}
              onPress={() => chooseAnswer(choice)}
              style={[styles.sugarOption, isSelected ? (isCorrect ? styles.answerCorrect : styles.answerWrong) : undefined]}
            >
              <Image source={require('../../assets/images/game-sugar-cube.png')} style={styles.sugarCubeImage} resizeMode="contain" />
              <Text style={[rewardFont, styles.sugarOptionText, { color: theme.text }]}>{choice}</Text>
              <Text style={[buttonFont, styles.sugarOptionLabel, { color: theme.text }]}>cubes</Text>
            </Pressable>
          );
        })}
      </View>
      {message ? <Text style={[buttonFont, styles.feedback, { color: selected === answer ? '#168954' : '#C8447C' }]}>{message}</Text> : null}
    </Card>
  );
};

const CleanToothGame = ({ cleaned, canPlayAgain, onReplay, onClean, onReset, onComplete }: { cleaned: boolean[]; canPlayAgain: boolean; onReplay: () => boolean; onClean: (index: number) => void; onReset: () => void; onComplete: () => void }) => {
  const { theme, t } = useApp();
  const remaining = cleaned.filter((value) => !value).length;
  const cleanedCount = cleanItems.length - remaining;
  const [complete, setComplete] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const cleanSpot = (index: number) => {
    if (cleaned[index] || complete) return;
    const nextCleanedCount = cleanedCount + 1;
    onClean(index);
    if (nextCleanedCount === cleanItems.length) {
      setComplete(true);
      if (!awarded) {
        setAwarded(true);
        onComplete();
      }
    }
  };

  const starsEarned = 20;

  const restart = () => {
    if (!onReplay()) return;
    onReset();
    setComplete(false);
    setAwarded(false);
  };

  if (complete) {
    return (
      <GameWinResult
        message="You cleaned every germ, sweet, and plaque spot."
        points={starsEarned}
        canPlayAgain={canPlayAgain}
        onPlayAgain={restart}
      />
    );
  }

  return (
    <Card style={[styles.gamePanelBorder, styles.cleanCard, styles.cleanPlayCard]}>
      <Text style={[buttonFont, styles.cleanSubtitle, { color: '#4E7771' }]}>Tap every germ, sweet, and plaque spot.</Text>
      <View style={styles.cleanProgressShell}><View style={[styles.cleanProgressFill, { width: `${(cleanedCount / cleanItems.length) * 100}%` }]} /></View>
      <Text style={[rewardFont, styles.rescueScore, { color: theme.primary }]}>Score: {cleanedCount} / {cleanItems.length}</Text>
      <View style={styles.toothPlayArea}>
        <View style={styles.bigTooth}>
          <Image source={require('../../assets/images/game-rescue-tooth.png')} style={styles.rescueToothImage} resizeMode="contain" />
        </View>
        {cleanItems.map((item, index) => {
          const positions = [styles.cleanItemA, styles.cleanItemB, styles.cleanItemC, styles.cleanItemD, styles.cleanItemE, styles.cleanItemF];
          return cleaned[index] ? null : (
            <Pressable key={`${item.label}-${index}`} onPress={() => cleanSpot(index)} style={[styles.cleanItem, positions[index]]}>
              {item.image ? <Image source={item.image} style={styles.cleanItemImage} resizeMode="contain" /> : <Ionicons name={item.icon} size={24} color={item.color} />}
            </Pressable>
          );
        })}
      </View>
      <Text style={[buttonFont, styles.feedback, { color: '#168954' }]}>{remaining === 0 ? 'Smile rescued!' : `Nice cleaning! ${remaining} spots left.`}</Text>
    </Card>
  );
};

const SmileQuizGame = ({ canPlayAgain, onReplay, onComplete }: { canPlayAgain: boolean; onReplay: () => boolean; onComplete: () => void }) => {
  const { theme, t } = useApp();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const question = quizQuestions[questionIndex];
  const progress = complete ? 1 : questionIndex / quizQuestions.length;
  const isCorrect = selected === question.answer;

  const choose = (index: number) => { if (selected !== null) return; setSelected(index); if (index === question.answer) setCorrectCount((value) => value + 1); };
  const next = () => {
    if (selected === null) return;
    if (questionIndex === quizQuestions.length - 1) {
      const didWin = correctCount > 2;
      setComplete(true);
      if (didWin && !awarded) {
        setAwarded(true);
        onComplete();
      }
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  };

  const restart = () => {
    if (!onReplay()) return;
    setQuestionIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setComplete(false);
    setAwarded(false);
  };

  if (complete) {
    if (correctCount > 2) {
      return (
        <GameWinResult
          message={t('quizAnswered').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${quizQuestions.length}`)}
          points={25}
          canPlayAgain={canPlayAgain}
          onPlayAgain={restart}
        />
      );
    }

    return (
      <Card style={[styles.gamePanelBorder, styles.quizCard, styles.quizCompleteCard]}>
        <View style={[styles.resultBadge, styles.retryBadge]}>
          <Image source={retryIconImage} style={styles.retryIconImage} resizeMode="contain" />
        </View>
        <Text style={[headingFont, styles.resultTitle, { color: '#C8447C' }]}>{t('tryAgainGame')}</Text>
        <Text style={[buttonFont, styles.resultText, { color: theme.text }]}>
          {t('quizAnswered').replace('{{count}}', `${correctCount}`).replace('{{total}}', `${quizQuestions.length}`)}
        </Text>
        <Text style={[rewardFont, styles.score, { color: '#C8447C' }]}>{t('scoreToWin3')}</Text>
        {canPlayAgain ? <AppButton label={t('tryAgainGame')} onPress={restart} /> : <LimitReachedNote />}
      </Card>
    );
  }

  return (
    <Card style={[styles.gamePanelBorder, styles.quizCard, styles.quizPlayCard]}>
      <Text style={[buttonFont, styles.quizSubtitle]}>Question {questionIndex + 1} / {quizQuestions.length}</Text>
      <Text style={[rewardFont, styles.quizLiveScore, { color: theme.primary }]}>Score: {correctCount}</Text>
      <View style={styles.quizProgressShell}><View style={[styles.quizProgressFill, { width: `${progress * 100}%` }]} /></View>
      <View style={styles.questionBox}>
        <Image source={require('../../assets/images/game-genius-icon.png')} style={styles.questionIconImage} resizeMode="contain" />
        <Text style={[buttonFont, styles.questionText, { color: theme.text }]}>{question.question}</Text>
      </View>
      <View style={styles.answerList}>
        {question.choices.map((choice, index) => {
          const chosen = selected === index;
          const answer = question.answer === index;
          const disabled = selected !== null && !chosen;
          return (
            <Pressable key={choice.label} onPress={() => choose(index)} style={[styles.answerRow, chosen && answer ? styles.answerCorrect : undefined, chosen && !answer ? styles.answerWrong : undefined, disabled ? styles.answerDisabled : undefined]}>
              <View style={styles.answerImageBox}>
                {choice.image ? <Image source={choice.image} style={styles.answerImage} resizeMode="contain" /> : <Ionicons name={choice.icon} size={25} color={choice.color} />}
              </View>
              <Text style={[buttonFont, styles.answerText, { color: theme.text }]}>{choice.label}</Text>
              {chosen && answer ? <Ionicons name="checkmark" size={24} color="#31C778" /> : null}
            </Pressable>
          );
        })}
      </View>
      {selected !== null ? <Text style={[buttonFont, styles.feedback, { color: isCorrect ? '#168954' : '#C8447C' }]}>{isCorrect ? 'Brilliant! Your tooth brain is sparkling.' : 'Nice try! Keep thinking like a Tooth Genius.'}</Text> : null}
      {selected !== null ? <AppButton label={questionIndex === quizQuestions.length - 1 ? 'Finish' : 'Next ›'} onPress={next} /> : null}
    </Card>
  );
};

export const GamesScreen = () => {
  const { t, games, child, gamePlays, recordGamePlay, awardGame, theme } = useApp();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [cleaned, setCleaned] = useState<boolean[]>(cleanItems.map(() => false));
  const availableGames = games.filter((game) => game.ageGroups.includes(child.ageGroup));
  const selectedGame = availableGames.find((game) => game.id === selectedGameId) ?? null;

  const openGame = (game: Game) => {
    const used = gamePlays[game.id] ?? 0;
    if (used >= game.dailyLimit) return;
    if (!recordGamePlay(game.id)) return;
    setSelectedGameId(game.id);
    setScore(0);
    setCleaned(cleanItems.map(() => false));
    if (game.id === 'brush-sequence') awardGame(game.id);
  };
  const leaveGame = () => { setSelectedGameId(null); setScore(0); };
  const replaySelectedGame = () => selectedGame ? recordGamePlay(selectedGame.id) : false;

  if (selectedGame) {
    const selectedGamePlays = gamePlays[selectedGame.id] ?? 0;
    const canPlayAgain = selectedGamePlays < selectedGame.dailyLimit;

    return (
      <Screen gradientBackground showDecorations={false}>
        <GameHeader game={{ ...selectedGame, titleKey: t(selectedGame.titleKey) }} onBack={leaveGame} />
        {selectedGame.id === 'plaque-pop' ? <StrongToothGame canPlayAgain={canPlayAgain} onReplay={replaySelectedGame} onWin={() => awardGame(selectedGame.id)} /> : selectedGame.id === 'food-sorter' ? <HealthyPicksGame canPlayAgain={canPlayAgain} onReplay={replaySelectedGame} onWin={() => awardGame(selectedGame.id)} /> : selectedGame.id === 'sugar-detective' ? <SugarDetectiveGame canPlayAgain={canPlayAgain} onReplay={replaySelectedGame} onComplete={() => awardGame(selectedGame.id)} /> : selectedGame.id === 'clean-tooth' ? <CleanToothGame cleaned={cleaned} canPlayAgain={canPlayAgain} onReplay={replaySelectedGame} onClean={(index) => setCleaned((items) => items.map((item, itemIndex) => itemIndex === index ? true : item))} onReset={() => setCleaned(cleanItems.map(() => false))} onComplete={() => awardGame(selectedGame.id)} /> : selectedGame.id === 'smile-quiz' ? <SmileQuizGame canPlayAgain={canPlayAgain} onReplay={replaySelectedGame} onComplete={() => awardGame(selectedGame.id)} /> : <GenericGame game={selectedGame} score={score} onScore={() => setScore((value) => value + 1)} />}
      </Screen>
    );
  }

  return (
    <Screen gradientBackground showDecorations={false}>
      <Text style={[headingFont, styles.screenTitle]}>{t('games')}</Text>
      {availableGames.map((game) => {
        const used = gamePlays[game.id] ?? 0;
        const left = Math.max(game.dailyLimit - used, 0);
        const icon = gameIcons[game.id] ?? gameIcons['plaque-pop'];
        return (
          <Card key={game.id} style={styles.listCard}>
            <View style={styles.row}>
              <IconBubble spec={icon} size={game.id === 'clean-tooth' ? 86 : 64} />
              <View style={styles.copy}>
                <Text style={styles.gameCardTitle}>{t(game.titleKey)}</Text>
                <Text style={[bodyFont, styles.gameCardDescription]}>
                  {t(game.descriptionKey)}
                </Text>
                <Text style={[bodyFont, styles.limit, { color: left > 0 ? theme.primary : '#C8447C' }]}>{left > 0 ? `${left} ${t('playsLeft')}` : t('comeBackTomorrow')}</Text>
              </View>
            </View>
            <AppButton
              label={left > 0 ? `${t('play')} +${game.points}` : t('limitReachedShort')}
              onPress={() => openGame(game)}
              variant={left > 0 ? 'primary' : 'secondary'}
              style={[
                styles.gamePlayButton,
                left <= 0 ? { backgroundColor: '#F8A5C2', borderColor: '#C8447C' } : undefined
              ]}
            />
          </Card>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  gamePanelBorder: { gap: 14, alignItems: 'center', backgroundColor: '#F7FFFC',borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  listCard: { gap: 14, alignItems: 'center', backgroundColor: '#F7FFFC',borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  screenTitle: {
    alignSelf: 'center',
    color: '#41438F',
    fontSize: 40,
    lineHeight: 40,
    textAlign: 'center'
  },
  row: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconBubble: { alignItems: 'center', justifyContent: 'center' },
  iconImage: { borderRadius: 12 },
  copy: { flex: 1, gap: 4 },
  gameCardTitle: {
    color: '#41438F',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 25,
    lineHeight: 31
  },
  gameCardDescription: {
    color: '#867f78c6',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 23
  },
  gamePlayButton: {
    alignSelf: 'center',
    width: 250,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#1D9BF0',
    borderColor: '#1D9BF0',
    marginBottom: 10
  },
  limit: { fontWeight: '900', fontSize: 15 },
  gameHeader: { gap: 12 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: '#000000', fontFamily: 'Fredoka_700Bold', fontSize: 17, fontWeight: '900'},
  focusTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  focusTitleCopy: { flex: 1 },
  focusGameTitle: {
    color: '#41438F',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 31,
    lineHeight: 38
  },
  focusCard: { gap: 18, alignItems: 'center' },
  playTitle: { fontSize: 20, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  largeTargetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  largeTarget: { width: '45%', minHeight: 112, borderRadius: 24, borderWidth: 2, borderColor: '#000000', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10 },
  targetLabel: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  score: { textAlign: 'center', fontSize: 22, fontFamily: 'Fredoka_700Bold' },
  sugarCard: { gap: 14, alignItems: 'center', backgroundColor: '#F7FFFC',borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3},
  sugarTopRow: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  sugarTitle: { flex: 1, color: '#155B52', fontSize: 25, lineHeight: 31, fontFamily: 'Fredoka_700Bold' },
  sugarScore: { fontSize: 20, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  sugarRule: { width: '100%', borderRadius: 18, backgroundColor: '#E8FBF5', color: '#155B52', fontSize: 15, fontFamily: 'Fredoka_700Bold', paddingVertical: 10, textAlign: 'center' },
  productCard: { width: '100%', minHeight: 150, borderRadius: 28, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  productImage: { width: 110, height: 110 },
  productCopy: { flex: 1, gap: 8 },
  productName: { fontSize: 24, lineHeight: 30, fontFamily: 'Fredoka_700Bold' },
  sugarGrams: { alignSelf: 'flex-start', borderRadius: 16, backgroundColor: '#FFF4C7', color: '#9B6500', fontSize: 18, fontFamily: 'Fredoka_700Bold', paddingHorizontal: 12, paddingVertical: 7 },
  sugarQuestion: { fontSize: 18, lineHeight: 24, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  sugarOptions: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  sugarOption: { width: '47%', minHeight: 96, borderRadius: 28, borderWidth: 0, borderColor: '#c6c0c0da', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 8, shadowColor: '#000000', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  sugarCubeImage: { width: 36, height: 36 },
  sugarOptionText: { fontSize: 27, lineHeight: 32, fontFamily: 'Fredoka_700Bold' },
  sugarOptionLabel: { fontSize: 13, fontFamily: 'Fredoka_700Bold', opacity: 0.72 },
  sugarCompleteCard: { paddingVertical: 28 },
  sugarDetectiveImage: { width: 112, height: 112 },
  sugarCompleteTitle: { color: '#155B52', fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  sugarFinalScore: { fontSize: 34, fontWeight: '900' },
  sugarReward: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12 },
  sugarRewardText: { color: '#8C9AAA', fontSize: 16, fontWeight: '900' },
  strongCard: { gap: 16, alignItems: 'center' },
  roundProgressShell: { width: '100%', height: 12, borderRadius: 6, backgroundColor: '#DCEAF4', overflow: 'hidden' },
  roundProgressFill: { height: '100%', borderRadius: 6 },
  roundText: { fontSize: 15, fontWeight: '900', opacity: 0.72 },
  toothChoiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  toothChoice: { width: '46%', height: 150, backgroundColor: '#FFFFFF', borderRadius: 20,  alignItems: 'center', justifyContent: 'center', padding: 8, shadowColor: '#17324D', shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  toothChoiceCorrect: { borderColor: '#31C778', backgroundColor: '#E9FFF4' },
  toothChoiceWrong: { borderColor: '#FF5C8A', backgroundColor: '#FFEAF2' },
  toothChoiceImage: { width: '100%', height: 118 },
  choiceBadge: { position: 'absolute', top: 8, right: 8 },
  resultBadge: { width: 104, height: 104, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  resultBadgeImage: { backgroundColor: 'transparent', borderRadius: 0 },
  resultTrophyImage: { width: 118, height: 118 },
  winResultCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 30
  },
  winTrophyImage: { height: 132, width: 132 },
  winResultTitle: {
    color: '#168954',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center'
  },
  winResultMessage: {
    color: '#17324D',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center'
  },
  winPlayAgainButton: {
    borderRadius: 24,
    minHeight: 72,
    minWidth: 190,
    paddingHorizontal: 30
  },
  retryBadge: {
    backgroundColor: '#FFEAF2',
    shadowColor: '#FF5C8A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 3
  },
  retryIconImage: { width: 108, height: 108 },
  resultTitle: { fontSize: 30, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  resultText: { fontSize: 17, lineHeight: 23, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  resultLimitText: { color: '#6F8184', fontSize: 16, fontFamily: 'Fredoka_700Bold', lineHeight: 22, textAlign: 'center' },
  resultRewardRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#afaaaaf0',
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 7
  },
  resultRewardText: { color: '#000000', fontSize: 30, fontFamily: 'Fredoka_700Bold', lineHeight: 34 },
  resultStarImage: { width: 50, height: 40 },
  feedback: { borderRadius: 18, backgroundColor: '#DDF8EE', paddingVertical: 12, paddingHorizontal: 14, textAlign: 'center', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  healthyCard: { gap: 16, alignItems: 'center' },
  foodChoiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  foodChoice: { width: '46%', height: 152, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderRadius: 20, padding: 8, shadowColor: '#17324D', shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 10 },
  foodChoiceCorrect: { borderColor: '#31C778', backgroundColor: '#E9FFF4' },
  foodChoiceWrong: { borderColor: '#FF5C8A', backgroundColor: '#FFEAF2' },
  foodChoiceImage: { width: '100%', height: 96 },
  foodChoiceLabel: { fontSize: 14, fontFamily: 'Fredoka_700Bold', textAlign: 'center', marginTop: 4 },
  cleanCard: { gap: 12, alignItems: 'center', overflow: 'hidden' },
  cleanTitle: { color: '#41438F', fontFamily: 'Fredoka_700Bold', fontSize: 28, lineHeight: 34, textAlign: 'center' },
  cleanPlayCard: { backgroundColor: '#E8FBF5', paddingTop: 22 },
  cleanSubtitle: { fontSize: 15, fontFamily: 'Fredoka_700Bold' },
  cleanProgressShell: { width: '92%', height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  cleanProgressFill: { height: '100%', borderRadius: 6, backgroundColor: '#2BBBAD' },
  rescueScore: { fontSize: 18, fontFamily: 'Fredoka_700Bold' },
  toothPlayArea: { width: 290, height: 330, alignItems: 'center', justifyContent: 'center' },
  bigTooth: { width: 224, height: 266, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  rescueToothImage: { width: 214, height: 258 },
  cleanItem: { position: 'absolute', width: 58, height: 58, alignItems: 'center', justifyContent: 'center', shadowColor: '#17324D', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  cleanItemImage: { width: 54, height: 54 },
  cleanItemA: { top: 74, left: 76 },
  cleanItemB: { top: 90, right: 72 },
  cleanItemC: { top: 154, left: 58 },
  cleanItemD: { top: 156, right: 54 },
  cleanItemE: { bottom: 76, left: 96 },
  cleanItemF: { bottom: 58, right: 88 },
  rescueCompleteCard: { backgroundColor: '#F7FFFC', paddingVertical: 28 },
  rescueCompleteTooth: { width: 126, height: 136 },
  quizCard: { gap: 14, backgroundColor: '#E8FBF5' },
  quizPlayCard: { paddingTop: 24 },
  quizTitle: { color: '#41438F', fontFamily: 'Fredoka_700Bold', fontSize: 28, lineHeight: 34, textAlign: 'center' },
  quizLiveScore: { fontSize: 18, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  quizSubtitle: { color: '#4E7771', fontSize: 15, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  quizProgressShell: { height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  quizProgressFill: { height: '100%', borderRadius: 6, backgroundColor: '#2BBBAD' },
  questionBox: { minHeight: 122, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18 },
  questionIconImage: { width: 58, height: 58 },
  questionText: { fontSize: 18, lineHeight: 24, fontFamily: 'Fredoka_700Bold', textAlign: 'center' },
  answerList: { gap: 12, width: 300 },
  answerRow: { minHeight: 70, borderRadius: 18, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 8, shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  answerImageBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F7FBFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  answerImage: { width: 42, height: 42 },
  answerCorrect: { borderColor: '#31C778', backgroundColor: '#E9FFF4' },
  answerWrong: { borderColor: '#FF5C8A', backgroundColor: '#FFEAF2' },
  answerDisabled: { opacity: 0.38 },
  answerText: { flex: 1, fontSize: 16, fontWeight: '900' },
  quizCompleteCard: { alignItems: 'center', backgroundColor: '#F7FFFC' },
  quizCompleteImage: { width: 124, height: 124 },
  quizCompleteTitle: { color: '#155B52', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  quizScore: { fontSize: 30, fontFamily: 'Fredoka_700Bold' },
  quizScoreSmall: { color: '#8C9AAA', fontSize: 14, fontFamily: 'Fredoka_700Bold'},
  quizReward: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12 },
  quizRewardText: { color: '#8C9AAA', fontSize: 16, fontWeight: '900' },
  quizButtons: { width: '100%' }
});
