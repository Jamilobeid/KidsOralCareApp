import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const Screen = ({ children, scroll = true, contentContainerStyle }: ScreenProps) => {
  const { theme } = useApp();
  const content = (
    <View style={[styles.content, contentContainerStyle]}>
      <View pointerEvents="none" style={[styles.bubble, styles.bubbleTop, { backgroundColor: theme.secondary }]} />
      <View pointerEvents="none" style={[styles.bubble, styles.bubbleMid, { backgroundColor: theme.accent }]} />
      <View pointerEvents="none" style={[styles.dot, styles.dotOne, { backgroundColor: theme.primary }]} />
      <View pointerEvents="none" style={[styles.dot, styles.dotTwo, { backgroundColor: theme.accent }]} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 30, paddingBottom: 18, gap: 14 },
  bubble: { position: 'absolute', opacity: 0.28, borderRadius: 999 },
  bubbleTop: { width: 180, height: 180, top: -70, right: -60 },
  bubbleMid: { width: 96, height: 96, top: 170, left: -42 },
  dot: { position: 'absolute', opacity: 0.22, borderRadius: 999 },
  dotOne: { width: 14, height: 14, top: 96, left: 32 },
  dotTwo: { width: 10, height: 10, top: 138, right: 58 }
});

