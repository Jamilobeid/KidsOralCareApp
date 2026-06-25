import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useApp } from '../context/AppContext';

export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { theme } = useApp();
  return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.secondary }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 18,
    gap: 10,
    shadowColor: '#4E718C',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  }
});
