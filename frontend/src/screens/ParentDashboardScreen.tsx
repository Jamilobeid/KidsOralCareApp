import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedStatIcon } from '../components/AnimatedMascots';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatPill } from '../components/StatPill';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { bodyFont, rewardFont } from '../utils/kidStyle';

export const ParentDashboardScreen = () => {
  const { t, child, brushingCountToday, reminders, setReminders, saveReminders, theme } = useApp();
  const completionMarks = brushingCountToday >= 2 ? 'Complete' : 'Not yet';

  return (
    <Screen>
      <Title size={34}>{t('parentDashboard')}</Title>
      <View style={styles.stats}>
        <StatPill label={t('completion')} value={`${brushingCountToday}/2`} footer={completionMarks} />
        <StatPill label={t('smileStars')} value={child.points} icon="star" />
        <StatPill label={t('badges')} value={child.badges.length} icon="badge" />
      </View>
      <Card>
        <Title size={22}>{t('childProfiles')}</Title>
        <BodyText>{child.nickname} - age {child.age} - {child.ageGroup}</BodyText>
      </Card>
      <Card>
        <Title size={22}>{t('morningReminder')}</Title>
        <TextInput value={reminders.morning} onChangeText={(value) => setReminders({ ...reminders, morning: value })} style={[bodyFont, styles.input, { borderColor: theme.primary, color: theme.text }]} />
        <Title size={22}>{t('eveningReminder')}</Title>
        <TextInput value={reminders.evening} onChangeText={(value) => setReminders({ ...reminders, evening: value })} style={[bodyFont, styles.input, { borderColor: theme.primary, color: theme.text }]} />
        <AppButton label={t('saveReminders')} onPress={saveReminders} />
      </Card>
      <Card>
        <View style={styles.gameTitle}>
          <Title size={22}>{t('gameLimits')}</Title>
          <AnimatedStatIcon type="game" />
        </View>
        <Text style={[bodyFont, styles.limitText, { color: theme.text }]}>
          Each child can only play the same game three times for day, and with that we can create inspiration and motivation for the following days!
        </Text>
        <Text style={[rewardFont, styles.thanks, { color: theme.primary }]}>Thank you for using our application!</Text>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  input: { borderWidth: 2, borderRadius: 18, padding: 12, fontSize: 18, fontWeight: '900', backgroundColor: '#FFFFFF' },
  gameTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  limitText: { fontSize: 17, fontWeight: '900', lineHeight: 24 },
  thanks: { fontSize: 18, fontWeight: '900', lineHeight: 25 }
});

