import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useApp } from '../context/AppContext';
import { buttonFont } from '../utils/kidStyle';

export const AppButton = ({ label, onPress, variant = 'primary', style }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; style?: StyleProp<ViewStyle> }) => {
  const { theme } = useApp();
  const backgroundColor = variant === 'primary' ? theme.primary : variant === 'secondary' ? theme.accent : 'transparent';
  const color = variant === 'ghost' ? theme.primary : '#FFFFFF';

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor, borderColor: variant === 'ghost' ? theme.secondary : theme.primary, opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      <Text style={[buttonFont, styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#294C60',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  text: { fontSize: 20, fontFamily: 'Fredoka_700Bold' }
});

