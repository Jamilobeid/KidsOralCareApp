import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';

export const LeaderboardScreen = () => {
  const { t, leaderboard, theme } = useApp();
  return (
    <Screen>
      <Title>{t('leaderboard')}</Title>
      <BodyText>{t('childSafeRank')}</BodyText>
      {leaderboard.map((entry, index) => (
        <Card key={entry.id}>
          <View style={styles.row}>
            <Text style={[styles.rank, { color: theme.primary }]}>#{index + 1}</Text>
            <Text style={styles.avatar}>{avatarGlyph(entry.avatar)}</Text>
            <View style={styles.copy}>
              <Title size={20}>{entry.nickname}</Title>
              <BodyText>{t('level')} {entry.level}</BodyText>
            </View>
            <Text style={[styles.points, { color: theme.primary }]}>{entry.points}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const avatarGlyph = (avatar: string) => ({ star: '⭐', sun: '☀️', rocket: '🚀', leaf: '🍃', rainbow: '🌈', tooth: '🦷' }[avatar] ?? '⭐');

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { fontSize: 22, fontWeight: '900', width: 44 },
  avatar: { fontSize: 34 },
  copy: { flex: 1 },
  points: { fontSize: 20, fontWeight: '900' }
});
