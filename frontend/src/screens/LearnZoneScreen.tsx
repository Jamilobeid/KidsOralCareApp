import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { learnLessons } from '../data/learnLessons';
import { bodyFont, buttonFont, headingFont } from '../utils/kidStyle';

export const LearnZoneScreen = () => {
  const { t } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = learnLessons.find((lesson) => lesson.id === selectedId);

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.hero}>
        <Ionicons name="school" size={45} color="#6155F6" />
        <Text style={[headingFont, styles.title]}>{t('learnZone')}</Text>
        <Text style={[bodyFont, styles.subtitle]}>{t('learnZoneSubtitle')}</Text>
        <View style={styles.onlineBadge}><Ionicons name="wifi" size={16} color="#2563A8" /><Text style={[buttonFont, styles.onlineText]}>{t('internetRequiredForVideos')}</Text></View>
      </View>

      {selected ? (
        <View style={styles.playerCard}>
          <Pressable accessibilityRole="button" onPress={() => setSelectedId(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#41438F" /><Text style={[buttonFont, styles.backText]}>{t('back')}</Text>
          </Pressable>
          <Text style={[headingFont, styles.lessonTitle]}>{t(selected.titleKey)}</Text>
          {selected.uri ? (
            <Video source={{ uri: selected.uri }} useNativeControls resizeMode={ResizeMode.CONTAIN} style={styles.video} />
          ) : (
            <View style={styles.pending}><Ionicons name="videocam-outline" size={48} color="#7B8CA0" /><Text style={[bodyFont, styles.pendingText]}>{t('lessonVideoPending')}</Text></View>
          )}
        </View>
      ) : (
        <View style={styles.list}>{learnLessons.map((lesson) => (
          <Pressable key={lesson.id} accessibilityRole="button" onPress={() => setSelectedId(lesson.id)} style={({ pressed }) => [styles.lesson, pressed && styles.pressed]}>
            <View style={styles.playIcon}><Ionicons name="play" size={21} color="#FFFFFF" /></View>
            <Text style={[headingFont, styles.lessonText]}>{t(lesson.titleKey)}</Text>
            <Ionicons name="chevron-forward" size={22} color="#6B7280" />
          </Pressable>
        ))}</View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingBottom: 120 }, hero: { alignItems: 'center', gap: 8 }, title: { color: '#41438F', fontSize: 36, lineHeight: 43 }, subtitle: { color: '#526A68', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  onlineBadge: { alignItems: 'center', backgroundColor: '#E8F4FF', borderRadius: 999, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 7 }, onlineText: { color: '#2563A8', fontSize: 11 },
  list: { gap: 11 }, lesson: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, flexDirection: 'row', gap: 12, minHeight: 76, padding: 14 }, pressed: { opacity: 0.82 }, playIcon: { alignItems: 'center', backgroundColor: '#6155F6', borderRadius: 18, height: 44, justifyContent: 'center', width: 44 }, lessonText: { color: '#17324D', flex: 1, fontSize: 17, lineHeight: 22 },
  playerCard: { backgroundColor: '#FFFFFF', borderRadius: 26, gap: 14, padding: 16 }, backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 6, minHeight: 40 }, backText: { color: '#41438F', fontSize: 14 }, lessonTitle: { color: '#17324D', fontSize: 23, lineHeight: 29 }, video: { aspectRatio: 16 / 9, backgroundColor: '#000000', borderRadius: 18, width: '100%' }, pending: { alignItems: 'center', aspectRatio: 16 / 9, backgroundColor: '#EEF2F4', borderRadius: 18, gap: 10, justifyContent: 'center', padding: 20 }, pendingText: { color: '#526A68', fontSize: 14, lineHeight: 21, textAlign: 'center' }
});
