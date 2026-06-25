import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { bodyFont } from '../utils/kidStyle';

export const BouncyTooth = ({ withFlags = false, size = 92 }: { withFlags?: boolean; size?: number }) => {
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.25, duration: 700, useNativeDriver: true })
        ])
      ])
    ).start();
  }, [float, glow]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const rotate = float.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <Animated.View style={[styles.toothWrap, { transform: [{ translateY }, { rotate }] }]}>
      <Animated.View style={[styles.glow, { opacity: glow }]} />
      <Ionicons name="sparkles" size={size} color="#17324D" style={styles.tooth} />
      {withFlags ? (
        <View style={styles.flagPaint}>
          <Text style={styles.flagText}>EN</Text>
          <Text style={styles.flagText}>FR</Text>
          <Text style={styles.flagText}>AR</Text>
        </View>
      ) : null}
      <Ionicons name="star" size={22} color="#FFB703" style={styles.sparkle} />
    </Animated.View>
  );
};

export const FlagTooth = ({ flag }: { flag: string }) => (
  <View style={styles.flagToothWrap}>
    <Ionicons name="sparkles" size={46} color="#17324D" style={styles.flagToothBase} />
    <Text style={styles.flagOnTooth}>{flag}</Text>
  </View>
);

export const AnimatedStatIcon = ({ type }: { type: 'star' | 'badge' | 'check' | 'game' }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.14, duration: 520, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 520, useNativeDriver: true })
      ])
    ).start();
  }, [scale]);

  const icon = type === 'star' ? 'star' : type === 'badge' ? 'medal' : type === 'game' ? 'game-controller' : 'checkmark-circle';
  return (
    <Animated.View style={[styles.statIcon, { transform: [{ scale }] }]}>
      <Ionicons name={icon} size={34} color="#FFB703" />
    </Animated.View>
  );
};

export const TalkingTeeth = () => {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 620, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 620, useNativeDriver: true })
      ])
    ).start();
  }, [bob]);
  const up = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View style={styles.talkWrap}>
      <Animated.View style={[styles.toothTalk, { transform: [{ translateY: up }] }]}>
        <Ionicons name="sparkles" size={42} color="#17324D" />
        <Text style={styles.bubbleText}>Brush time!</Text>
      </Animated.View>
      <Animated.View style={[styles.toothTalk, { transform: [{ translateY: up }] }]}>
        <Ionicons name="sparkles" size={42} color="#17324D" />
        <Text style={styles.bubbleText}>Shine bright!</Text>
      </Animated.View>
    </View>
  );
};

export const Hourglass = ({ progress }: { progress: number }) => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const sandHeight = `${Math.max(8, 100 - progress * 100)}%` as const;
  const bottomSandHeight = `${Math.min(100, progress * 100)}%` as const;

  return (
    <Animated.View style={[styles.hourglass, { transform: [{ rotateY: rotate }] }]}>
      <View style={styles.glassTop}><View style={[styles.sandTop, { height: sandHeight }]} /></View>
      <Text style={styles.sandDrop}>.</Text>
      <View style={styles.glassBottom}><View style={[styles.sandBottom, { height: bottomSandHeight }]} /></View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toothWrap: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 118, height: 118, borderRadius: 59, backgroundColor: '#FFF4A8' },
  tooth: { textShadowColor: 'rgba(35, 68, 90, 0.25)', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 6 },
  sparkle: { position: 'absolute', right: 0, top: 4 },
  flagPaint: { position: 'absolute', flexDirection: 'row', gap: 2, top: 40, backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2 },
  flagText: { ...bodyFont, fontSize: 10, fontWeight: '900', color: '#17324D' },
  flagToothWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  flagToothBase: { position: 'absolute', opacity: 0.98, textShadowColor: 'rgba(35,68,90,0.18)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 4 },
  flagOnTooth: { position: 'absolute', top: 18, fontSize: 21 },
  statIcon: { alignItems: 'center', marginTop: 6 },
  talkWrap: { flexDirection: 'row', justifyContent: 'space-around', gap: 12, marginTop: 14 },
  toothTalk: { alignItems: 'center', flex: 1 },
  bubbleText: { ...bodyFont, marginTop: 4, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7, color: '#17324D', fontWeight: '900', overflow: 'hidden' },
  hourglass: { width: 64, height: 96, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  glassTop: { width: 50, height: 38, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 3, borderColor: '#44BFE3', overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#E8FAFF' },
  glassBottom: { width: 50, height: 38, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, borderWidth: 3, borderColor: '#44BFE3', overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#E8FAFF' },
  sandTop: { backgroundColor: '#FFB703', width: '100%' },
  sandBottom: { backgroundColor: '#FFB703', width: '100%' },
  sandDrop: { color: '#FFB703', fontSize: 18, lineHeight: 14 }
});

