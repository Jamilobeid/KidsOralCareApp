import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

export const InternetRequiredScreen = () => {
  const { t } = useApp();
  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.card}>
        <Ionicons name="cloud-offline-outline" size={62} color="#805800" />
        <Text style={[headingFont, styles.title]}>{t('internetRequired')}</Text>
        <Text style={[bodyFont, styles.message]}>{t('internetRequiredMessage')}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingBottom: 120 },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, gap: 12, padding: 28 },
  title: { color: '#41438F', fontSize: 28, lineHeight: 35, textAlign: 'center' },
  message: { color: '#526A68', fontSize: 15, lineHeight: 23, textAlign: 'center' }
});
