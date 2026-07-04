import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';

const artwork = {
  smileStars: require('../../assets/images/parent-smile-star.png'),
  badges: require('../../assets/images/parent-badge-shield.png'),
  streak: require('../../assets/images/parent-day-streak.png'),
  totalBrushes: require('../../assets/images/parent-total-brushes.png'),
  weekBrushes: require('../../assets/images/parent-week-brushes.png'),
  morning: require('../../assets/images/parent-morning-reminder.png'),
  evening: require('../../assets/images/parent-evening-reminder.png'),
  game: require('../../assets/images/parent-game-controller.png')
};

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAILY_GAME_LIMIT_MINUTES = 20;
const MINUTES_PER_PLAY = 4;

const shiftTime = (time: string, minutesDelta: number) => {
  const [rawHour, rawMinute] = time.split(':').map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 7;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  const totalMinutes = (hour * 60 + minute + minutesDelta + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const nextMinute = (totalMinutes % 60).toString().padStart(2, '0');
  return `${nextHour}:${nextMinute}`;
};

const formatReminderTime = (time: string) => {
  const [rawHour, rawMinute] = time.split(':').map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 7;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${suffix}`;
};

export const ParentDashboardScreen = () => {
  const { t, child, brushingCountToday, reminders, setReminders, saveReminders, gamePlays, games } = useApp();
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const selectedBuddy = toothBuddies.find((buddy) => buddy.id === child.selectedCharacter) ?? toothBuddies[0];
  const currentWeekIndex = (new Date().getDay() + 6) % 7;
  const weeklyBrushes = WEEK_DAYS.map((_, index) => child.weeklyBrushes[index] ?? 0);
  const weeklyBrushDays = weeklyBrushes.filter((count) => count > 0).length;
  const morningDone = brushingCountToday >= 1;
  const eveningDone = brushingCountToday >= 2;
  const totalPlaysToday = Object.values(gamePlays).reduce((sum, plays) => sum + plays, 0);
  const usedGameMinutes = Math.min(totalPlaysToday * MINUTES_PER_PLAY, DAILY_GAME_LIMIT_MINUTES);
  const gameUsagePercent = Math.min(usedGameMinutes / DAILY_GAME_LIMIT_MINUTES, 1);
  const totalDailyGamePlays = games.reduce((sum, game) => sum + game.dailyLimit, 0);

  const updateReminderTime = (period: 'morning' | 'evening', minutesDelta: number) => {
    const current = period === 'morning' ? reminders.morning : reminders.evening;
    const nextTime = shiftTime(current, minutesDelta);
    setReminders({ ...reminders, [period]: nextTime });
  };

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <Text style={styles.pageTitle}>Parent Dashboard</Text>

      <View style={styles.heroCard}>
        <View style={styles.profileRow}>
          <View style={styles.buddyWrap}>
            <Image source={selectedBuddy.image} style={styles.buddyImage} resizeMode="contain" />
            <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>LVL {child.level}</Text></View>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.dashboardTitle}>{child.nickname}'s Dashboard</Text>
            <Text style={styles.encouragement}>Keep up the great work!</Text>
          </View>
        </View>

        <View style={styles.topStats}>
          <MetricCard image={artwork.smileStars} value={child.points} label="Smile Stars" color="#FF9F1C" background="#FFF7DF" />
          <MetricCard image={artwork.badges} value={child.badges.length} label="Badges" color="#8B35FF" background="#F7EEFF" />
          <MetricCard image={artwork.streak} value={weeklyBrushDays} label="Day Streak" color="#FF315E" background="#FFF0F1" />
        </View>

        <View style={styles.brushStats}>
          <SmallBrushStat image={artwork.totalBrushes} value={child.totalBrushes} label="Brushes" />
          <SmallBrushStat image={artwork.weekBrushes} value={`${weeklyBrushDays}/7`} label="This week" />
        </View>

        <View style={styles.todayCard}>
          <Text style={styles.sectionTitle}>Today's Brushing</Text>
          <View style={styles.brushingChecks}>
            <BrushCheck complete={morningDone} label="Morning" />
            <BrushCheck complete={eveningDone} label="Evening" />
          </View>
        </View>
      </View>

      <View style={styles.reminderStack}>
        <ReminderRow
          image={artwork.morning}
          title="Morning Reminder"
          value={reminders.morning}
          onDecrease={() => updateReminderTime('morning', -15)}
          onIncrease={() => updateReminderTime('morning', 15)}
          enabled={morningEnabled}
          onToggle={setMorningEnabled}
          accent="#05AEEF"
          background="#EAF8FF"
          onSubmit={saveReminders}
        />
        <ReminderRow
          image={artwork.evening}
          title="Evening Reminder"
          value={reminders.evening}
          onDecrease={() => updateReminderTime('evening', -15)}
          onIncrease={() => updateReminderTime('evening', 15)}
          enabled={eveningEnabled}
          onToggle={setEveningEnabled}
          accent="#7465FF"
          background="#EEF1FF"
          onSubmit={saveReminders}
        />
      </View>

      <View style={styles.weekSection}>
        <Text style={styles.weekTitle}>This week</Text>
        <View style={styles.weekCard}>
          {WEEK_DAYS.map((day, index) => {
            const brushCount = weeklyBrushes[index] ?? 0;
            const isToday = index === currentWeekIndex;
            const isFuture = index > currentWeekIndex;
            return <WeekDay key={`${day}-${index}`} day={day} brushCount={brushCount} active={isToday} future={isFuture} />;
          })}
        </View>
      </View>

      <View style={styles.gameTimeCard}>
        <View style={styles.gameHeader}>
          <View>
            <Text style={styles.gameTitle}>Game Time</Text>
          </View>
          <View style={styles.gameUsedBox}>
            <Text style={styles.gameUsedValue}>{totalPlaysToday}</Text>
            <Text style={styles.gameUsedLabel}>PLAYS</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${gameUsagePercent * 100}%` }]} />
          <Text style={styles.progressLabel}>{Math.round(gameUsagePercent * 100)}% USED</Text>
        </View>
        <Text style={styles.gameMinutesText}>{usedGameMinutes} minutes used today. {totalPlaysToday}/{totalDailyGamePlays} plays used today.</Text>
      </View>

      <View style={styles.limitCard}>
        <View style={styles.limitHeader}>
          <Text style={styles.limitTitle}>{t('gameLimits')}</Text>
          <Image source={artwork.game} style={styles.limitGameIcon} resizeMode="contain" />
        </View>
        <Text style={styles.limitText}>
          Each child can only play the same game three times for day, and with that we can create inspiration and motivation for the following days!
        </Text>
        <Text style={styles.thanks}>Thank you for using our application!</Text>
      </View>
    </Screen>
  );
};

const MetricCard = ({ image, value, label, color, background }: { image: ImageSourcePropType; value: number; label: string; color: string; background: string }) => (
  <View style={[styles.metricCard, { backgroundColor: background }]}>
    <Image source={image} style={styles.metricIcon} resizeMode="contain" />
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={[styles.metricLabel, { color }]}>{label.toUpperCase()}</Text>
  </View>
);

const SmallBrushStat = ({ image, value, label }: { image: ImageSourcePropType; value: string | number; label: string }) => (
  <View style={styles.smallBrushStat}>
    <Image source={image} style={styles.smallBrushIcon} resizeMode="contain" />
    <Text style={styles.smallBrushValue}>{value}</Text>
    <Text style={styles.smallBrushLabel}>{label}</Text>
  </View>
);

const BrushCheck = ({ complete, label }: { complete: boolean; label: string }) => (
  <View style={styles.brushCheck}>
    <View style={[styles.checkRing, complete ? styles.checkRingComplete : styles.checkRingEmpty]}>
      <View style={[styles.checkCircle, complete ? styles.checkCircleComplete : styles.checkCircleEmpty]}>
        {complete ? <Ionicons name="checkmark" size={35} color="#FFFFFF" /> : null}
      </View>
    </View>
    <Text style={[styles.checkLabel, complete ? styles.checkLabelComplete : styles.checkLabelEmpty]}>{label}</Text>
  </View>
);

const ReminderRow = ({ image, title, value, onDecrease, onIncrease, enabled, onToggle, accent, background, onSubmit }: {
  image: ImageSourcePropType;
  title: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  accent: string;
  background: string;
  onSubmit: () => void;
}) => (
  <View style={[styles.reminderRow, { backgroundColor: background }]}>
    <View style={styles.reminderIconTile}>
      <Image source={image} style={styles.reminderIcon} resizeMode="contain" />
    </View>
    <View style={styles.reminderCopy}>
      <Text style={[styles.reminderTitle, { color: accent }]}>{title}</Text>
      <View style={styles.timeStepper}>
        <Pressable onPress={onDecrease} style={[styles.timeStepButton, { backgroundColor: accent }]}>
          <Ionicons name="remove" size={18} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.reminderTime, { color: accent }]}>{formatReminderTime(value)}</Text>
        <Pressable onPress={onIncrease} style={[styles.timeStepButton, { backgroundColor: accent }]}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
    <Pressable onPress={onSubmit} style={[styles.saveTimeButton, { borderColor: accent }]}>
      <Ionicons name="play" size={18} color={accent} />
    </Pressable>
    <Switch value={enabled} onValueChange={onToggle} thumbColor="#FFFFFF" trackColor={{ false: '#CAD7E6', true: accent }} />
  </View>
);

const WeekDay = ({ day, brushCount, active, future }: { day: string; brushCount: number; active: boolean; future: boolean }) => {
  const complete = brushCount >= 2;
  const partial = brushCount === 1;

  return (
    <View style={styles.weekDay}>
      <View style={[styles.weekCircle, future && styles.weekCircleFuture, active && styles.weekCircleToday, complete && styles.weekCircleComplete]}>
        {partial ? <View style={styles.weekHalfFill} /> : null}
        {complete ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
      <Text style={[styles.weekDayLabel, active && styles.weekDayLabelActive]}>{day}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingBottom: 26 },
  pageTitle: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 34, lineHeight: 42, textAlign: 'center' },
  heroCard: { borderRadius: 32, backgroundColor: '#FFFFFF', padding: 20, gap: 20, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  buddyWrap: { width: 98, height: 98, borderRadius: 32, backgroundColor: '#F4F8FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#17324D', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  buddyImage: { width: 100, height: 100 },
  levelBadge: { position: 'absolute', bottom: -8, borderRadius: 999, backgroundColor: '#FFD21F', paddingHorizontal: 16, paddingVertical: 5 },
  levelBadgeText: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 13, lineHeight: 16 },
  profileCopy: { flex: 1 },
  dashboardTitle: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 29, lineHeight: 35 },
  encouragement: { color: '#627693', fontFamily: 'Fredoka_700Bold', fontSize: 16, lineHeight: 22 },
  topStats: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, minHeight: 102, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(23,50,77,0.08)', alignItems: 'center', justifyContent: 'center', padding: 9 },
  metricIcon: { width: 40, height: 40, marginBottom: 10 },
  metricValue: { fontFamily: 'Fredoka_700Bold', fontSize: 25, lineHeight: 31 },
  metricLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 10, lineHeight: 13, textAlign: 'center' },
  brushStats: { flexDirection: 'row', gap: 12 },
  smallBrushStat: { flex: 1, minHeight: 94, borderRadius: 22, backgroundColor: '#F7FFFC', padding: 12, shadowColor: '#17324D', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  smallBrushIcon: { width: 40, height: 40 },
  smallBrushValue: { color: '#174D53', fontFamily: 'Fredoka_700Bold', fontSize: 25, lineHeight: 30 },
  smallBrushLabel: { color: '#7C8A98', fontFamily: 'Fredoka_700Bold', fontSize: 12, lineHeight: 15 },
  todayCard: { borderRadius: 28, backgroundColor: '#F5F8FB', padding: 22, gap: 22, alignItems: 'center' },
  sectionTitle: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 23, lineHeight: 28 },
  brushingChecks: { flexDirection: 'row', justifyContent: 'center', gap: 38 },
  brushCheck: { alignItems: 'center', gap: 9 },
  checkRing: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  checkRingComplete: { borderColor: '#8FF4E4' },
  checkRingEmpty: { borderColor: '#DCE5EE' },
  checkCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  checkCircleComplete: { backgroundColor: '#10D2BD' },
  checkCircleEmpty: { backgroundColor: '#EAF0F6' },
  checkLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 15, lineHeight: 19 },
  checkLabelComplete: { color: '#008B78' },
  checkLabelEmpty: { color: '#8A96A8' },
  reminderStack: { gap: 14 },
  reminderRow: { minHeight: 118, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(23,50,77,0.07)' },
  reminderIconTile: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  reminderIcon: { width: 46, height: 46 },
  reminderCopy: { flex: 1 },
  reminderTitle: { fontFamily: 'Fredoka_700Bold', fontSize: 16, lineHeight: 20 },
  timeStepper: { marginTop: 5, minHeight: 38, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.62)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, gap: 6 },
  timeStepButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  reminderTime: { flex: 1, fontFamily: 'Fredoka_700Bold', fontSize: 20, lineHeight: 25, textAlign: 'center' },
  saveTimeButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  weekSection: { gap: 9 },
  weekTitle: { color: '#174D53', fontFamily: 'Fredoka_700Bold', fontSize: 18, lineHeight: 24 },
  weekCard: { minHeight: 92, borderRadius: 24, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, shadowColor: '#17324D', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  weekDay: { alignItems: 'center', gap: 6 },
  weekCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: '#168A82', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  weekCircleComplete: { backgroundColor: '#2EC4B6', borderColor: '#2EC4B6' },
  weekCircleToday: { backgroundColor: '#E8FAF5', borderColor: '#087C72', borderWidth: 4 },
  weekCircleFuture: { backgroundColor: '#FFFFFF', borderColor: '#168A82', borderWidth: 3 },
  weekHalfFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', backgroundColor: '#2EC4B6' },
  weekDayLabel: { color: '#8492A6', fontFamily: 'Fredoka_700Bold', fontSize: 12, lineHeight: 15 },
  weekDayLabelActive: { color: '#087C72' },
  gameTimeCard: { borderRadius: 30, borderWidth: 3, borderColor: '#111111', backgroundColor: '#FFD83D', padding: 24, gap: 20, shadowColor: '#111111', shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 8, height: 10 }, elevation: 8 },
  gameHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  gameTitle: { color: '#111111', fontFamily: 'Fredoka_700Bold', fontSize: 27, lineHeight: 32 },
  gameLimit: { color: '#111111', fontFamily: 'Fredoka_700Bold', fontSize: 15, lineHeight: 20 },
  gameUsedBox: { width: 72, height: 86, borderRadius: 15, borderWidth: 3, borderColor: '#111111', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  gameUsedValue: { color: '#111111', fontFamily: 'Fredoka_700Bold', fontSize: 27, lineHeight: 33 },
  gameUsedLabel: { color: '#7C8088', fontFamily: 'Fredoka_700Bold', fontSize: 10, lineHeight: 13 },
  progressTrack: { height: 44, borderRadius: 16, borderWidth: 3, borderColor: '#111111', backgroundColor: '#FFFFFF', overflow: 'hidden', justifyContent: 'center' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#17181D' },
  progressLabel: { color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 15, lineHeight: 19, textAlign: 'center' },
  gameMinutesText: { color: '#111111', fontFamily: 'Fredoka_700Bold', fontSize: 14, lineHeight: 19 },
  limitCard: { borderRadius: 28, borderWidth: 3, borderColor: '#6BE2F3', backgroundColor: '#FFFFFF', padding: 22, gap: 14, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  limitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  limitTitle: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 28, lineHeight: 34 },
  limitGameIcon: { width: 46, height: 36 },
  limitText: { color: '#17324D', fontFamily: 'Fredoka_700Bold', fontSize: 19, lineHeight: 27 },
  thanks: { color: '#1D9BF0', fontFamily: 'Fredoka_700Bold', fontSize: 23, lineHeight: 29 }
});
