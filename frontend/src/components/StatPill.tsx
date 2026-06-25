import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { buttonFont, rewardFont } from '../utils/kidStyle';
import { AnimatedStatIcon } from './AnimatedMascots';

type StatPillProps = {
  label: string;
  value: string | number;
  icon?: 'star' | 'badge' | 'check' | 'game';
  imageSource?: ImageSourcePropType;
  footer?: string;
};

export const StatPill = ({ label, value, icon, imageSource, footer }: StatPillProps) => {
  const { theme } = useApp();

  return (
    <View style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.secondary }]}>
      <Text style={[buttonFont, styles.label, { color: theme.text }]}>{label}</Text>
      <Text style={[rewardFont, styles.value, { color: theme.text }]}>{value}</Text>
      {imageSource ? <Image source={imageSource} style={styles.imageIcon} resizeMode="contain" /> : null}
      {!imageSource && icon ? <AnimatedStatIcon type={icon} /> : null}
      {footer ? <Text style={[rewardFont, styles.footer, { color: theme.primary }]}>{footer}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minWidth: 96,
    borderRadius: 22,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 142,
    gap: 5
  },
  label: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  value: { fontSize: 23, fontWeight: '900', textAlign: 'center' },
  imageIcon: { width: 50, height: 50, marginTop: 2 },
  footer: { marginTop: 4, fontSize: 17, fontWeight: '900', textAlign: 'center' }
});

