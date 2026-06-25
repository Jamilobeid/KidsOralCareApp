import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

export const Title = ({ children, size = 28 }: { children: React.ReactNode; size?: number }) => {
  const { theme, isRtl } = useApp();
  return <Text style={[headingFont, styles.title, { color: theme.text, fontSize: size, lineHeight: Math.ceil(size * 1.28), textAlign: isRtl ? 'right' : 'left' }]}>{children}</Text>;
};

export const BodyText = ({ children }: { children: React.ReactNode }) => {
  const { theme, isRtl } = useApp();
  return <Text style={[bodyFont, styles.body, { color: theme.text, textAlign: isRtl ? 'right' : 'left' }]}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: { fontWeight: '900' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '600' }
});

