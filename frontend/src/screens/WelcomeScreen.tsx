import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { BodyText, Title } from '../components/Typography';
import { useApp } from '../context/AppContext';

export const WelcomeScreen = () => {
  const { t, setScreen, theme } = useApp();
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.tooth}>🦷</Text>
        <Title size={34}>{t('welcomeTitle')}</Title>
        <BodyText>{t('welcomeText')}</BodyText>
      </View>
      <Card style={{ backgroundColor: theme.secondary }}>
        <BodyText>{t('timerInstruction')}</BodyText>
      </Card>
      <AppButton label={t('start')} onPress={() => setScreen('auth')} />
      <AppButton label={t('language')} onPress={() => setScreen('language')} variant="ghost" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: 14 },
  tooth: { fontSize: 96, textAlign: 'center' }
});
