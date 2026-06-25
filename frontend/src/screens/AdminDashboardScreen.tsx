import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatPill } from '../components/StatPill';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';

export const AdminDashboardScreen = () => {
  const { t } = useApp();
  return (
    <Screen>
      <Title>{t('adminDashboard')}</Title>
      <View style={styles.stats}>
        <StatPill label={t('activeUsers')} value="128" />
        <StatPill label={t('brushingCompliance')} value="82%" />
        <StatPill label={t('engagement')} value="74%" />
      </View>
      <Card>
        <Title size={22}>{t('appUsage')}</Title>
        <BodyText>Demo analytics aggregate Firestore collections: brushingSessions, gameSessions, childProfiles, challenges, and rewards.</BodyText>
      </Card>
      <Card>
        <Title size={22}>{t('gameUsage')}</Title>
        <BodyText>Plaque Pop 42%, Food Sorter 31%, Sugar Detective 18%, Brush Sequence 9%.</BodyText>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({ stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 } });
