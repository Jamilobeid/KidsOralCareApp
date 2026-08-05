import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { buttonFont } from '../utils/kidStyle';

export const ConnectionBanner = () => {
  const { isOnline, pendingSyncCount, t } = useApp();

  if (isOnline && pendingSyncCount === 0) return null;

  const waiting = pendingSyncCount > 0;
  return (
    <View accessibilityRole="alert" style={[styles.banner, isOnline ? styles.syncing : styles.offline]}>
      <Ionicons name={isOnline ? 'sync' : 'cloud-offline-outline'} size={17} color="#FFFFFF" />
      <Text style={[buttonFont, styles.text]}>
        {t(isOnline ? 'syncingProgress' : waiting ? 'waitingToSync' : 'availableOffline')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 34, paddingHorizontal: 14, paddingVertical: 7, zIndex: 50 },
  offline: { backgroundColor: '#805800' },
  syncing: { backgroundColor: '#2563A8' },
  text: { color: '#FFFFFF', fontSize: 12, lineHeight: 16, textAlign: 'center' }
});
