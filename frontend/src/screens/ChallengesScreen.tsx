import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';

export const ChallengesScreen = () => {
  const { t, challenges, theme } = useApp();
  return (
    <Screen>
      <Title>{t('challenges')}</Title>
      {challenges.map((challenge) => {
        const percent = challenge.progress / challenge.target;
        return (
          <Card key={challenge.id}>
            <View style={styles.row}>
              <Title size={21}>{t(challenge.titleKey)}</Title>
              <Text style={[styles.points, { color: theme.primary }]}>+{challenge.points}</Text>
            </View>
            <BodyText>{t(challenge.descriptionKey)}</BodyText>
            <View style={styles.progressShell}><View style={[styles.progressFill, { width: `${percent * 100}%`, backgroundColor: theme.primary }]} /></View>
            <BodyText>{challenge.progress}/{challenge.target} • {challenge.cadence}</BodyText>
          </Card>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  points: { fontWeight: '900', fontSize: 18 },
  progressShell: { height: 14, borderRadius: 7, backgroundColor: '#DCEAF4', overflow: 'hidden' },
  progressFill: { height: '100%' }
});
