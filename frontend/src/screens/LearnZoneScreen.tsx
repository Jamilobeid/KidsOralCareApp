import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { educationalTopics, EducationalTopic } from '../data/educationalTopics';
import {
  checkInternetConnection,
  subscribeToInternetConnection
} from '../services/educationalVideoAccess';
import { bodyFont, buttonFont, headingFont } from '../utils/kidStyle';

const learnZoneImage = require('../../assets/images/custom-home-learn-zone.png');
const lessonPlayImage = require('../../assets/images/learn-zone-play.png');

const TopicContent = ({ topic, onBack }: { topic: EducationalTopic; onBack: () => void }) => {
  const { isRtl, language, recordEducationalVideoView, t } = useApp();
  const videoRef = useRef<Video>(null);
  const viewRecordedRef = useRef(false);
  const [positionMs, setPositionMs] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [isInternetConnected, setIsInternetConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const title = topic.title[language];
  const activeCue = topic.cues.find((cue) => positionMs >= cue.startMs && positionMs < cue.endMs);

  useEffect(() => {
    let isActive = true;
    void checkInternetConnection()
      .then((isConnected) => {
        if (isActive) setIsInternetConnected(isConnected);
      })
      .finally(() => {
        if (isActive) setIsCheckingConnection(false);
      });

    const unsubscribe = subscribeToInternetConnection((isConnected) => {
      if (isActive) {
        setIsInternetConnected(isConnected);
        setIsCheckingConnection(false);
      }
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.isPlaying && !viewRecordedRef.current) {
      viewRecordedRef.current = true;
      recordEducationalVideoView();
    }
    setPositionMs(status.positionMillis);
    if (status.didJustFinish) setHasFinished(true);
  };

  const replayVideo = async () => {
    viewRecordedRef.current = false;
    setHasFinished(false);
    setPositionMs(0);
    await videoRef.current?.setPositionAsync(0);
    await videoRef.current?.playAsync();
  };

  return (
    <View style={styles.topicCard}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Ionicons name={isRtl ? 'arrow-forward' : 'arrow-back'} size={20} color="#41438F" />
        <Text style={[buttonFont, styles.backText]}>{t('back')}</Text>
      </Pressable>

      <Text style={[headingFont, styles.topicTitle, isRtl && styles.rtlText]}>{title}</Text>

      <View style={styles.videoContainer}>
        {isInternetConnected && topic.video.remoteUrl ? (
          <Video
            ref={videoRef}
            accessibilityLabel={topic.videoAccessibilityLabel?.[language] ?? title}
            source={{ uri: topic.video.remoteUrl }}
            shouldPlay
            isLooping={false}
            useNativeControls
            progressUpdateIntervalMillis={100}
            onPlaybackStatusUpdate={handlePlaybackStatus}
            resizeMode={ResizeMode.CONTAIN}
            style={styles.video}
          />
        ) : (
          <View style={styles.wifiPanel}>
            {isCheckingConnection ? (
              <ActivityIndicator color="#6155F6" size="large" />
            ) : (
              <>
                <Ionicons name="wifi-outline" size={42} color="#6155F6" />
                <Text style={[bodyFont, styles.wifiText, isRtl && styles.rtlText]}>
                  {topic.video.remoteUrl ? t('wifiRequiredForVideo') : t('videoUnavailable')}
                </Text>
              </>
            )}
          </View>
        )}
        {hasFinished ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('playAgain')}
            onPress={() => void replayVideo()}
            style={styles.replayOverlay}
          >
            <View style={styles.replayButton}>
              <Ionicons name="refresh" size={32} color="#FFFFFF" />
            </View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.captionSlot}>
        {activeCue ? (
          <Text
            accessibilityRole="text"
            style={[headingFont, styles.videoCaption, isRtl && styles.rtlText]}
          >
            {activeCue.subtitles[language]}
          </Text>
        ) : null}
      </View>

      <View style={styles.imageSlot}>
        {activeCue ? (
          <Image
            accessibilityLabel={activeCue.subtitles[language]}
            source={activeCue.imageSource}
            resizeMode="contain"
            style={styles.educationalImage}
          />
        ) : null}
      </View>
    </View>
  );
};

export const LearnZoneScreen = () => {
  const { isRtl, language, t } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTopic = educationalTopics.find((topic) => topic.id === selectedId);

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.hero}>
        <Image source={learnZoneImage} style={styles.heroIcon} resizeMode="contain" />
        <Text style={[headingFont, styles.title]}>{t('learnZone')}</Text>
      </View>

      {selectedTopic ? (
        <TopicContent topic={selectedTopic} onBack={() => setSelectedId(null)} />
      ) : (
        <View style={styles.topicList}>
          {educationalTopics.map((topic) => (
            <Pressable
              key={topic.id}
              accessibilityRole="button"
              accessibilityLabel={topic.title[language]}
              onPress={() => setSelectedId(topic.id)}
              style={({ pressed }) => [styles.topicOption, pressed && styles.pressed]}
            >
              <Image source={lessonPlayImage} style={styles.topicIcon} resizeMode="contain" />
              <Text numberOfLines={2} style={[headingFont, styles.topicOptionText, isRtl && styles.rtlText]}>
                {topic.title[language]}
              </Text>
              <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={24} color="#6B7280" />
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingBottom: 120 },
  hero: { alignItems: 'center', gap: 8 },
  heroIcon: { height: 54, width: 54 },
  title: { color: '#41438F', fontSize: 36, lineHeight: 43, textAlign: 'center' },
  topicList: { gap: 12 },
  topicOption: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, flexDirection: 'row', gap: 12,
    minHeight: 84, padding: 14, shadowColor: '#4E718C', shadowOpacity: 0.1, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 2
  },
  pressed: { opacity: 0.82 },
  topicIcon: { height: 50, width: 50 },
  topicOptionText: { color: '#17324D', flex: 1, fontSize: 18, lineHeight: 23 },
  topicCard: { backgroundColor: '#FFFFFF', borderRadius: 26, gap: 14, padding: 16 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 6, minHeight: 40 },
  backText: { color: '#41438F', fontSize: 14 },
  topicTitle: { color: '#17324D', fontSize: 23, lineHeight: 29, textAlign: 'left' },
  videoContainer: { aspectRatio: 16 / 9, backgroundColor: '#EAF8F5', borderRadius: 20, overflow: 'hidden', width: '100%' },
  video: { height: '100%', width: '100%' },
  wifiPanel: { alignItems: 'center', flex: 1, gap: 10, justifyContent: 'center', padding: 16 },
  wifiText: { color: '#384F5E', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  replayOverlay: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  replayButton: { alignItems: 'center', backgroundColor: 'rgba(65, 67, 143, 0.88)', borderRadius: 999, height: 62, justifyContent: 'center', width: 62 },
  captionSlot: { justifyContent: 'center', minHeight: 75 },
  videoCaption: { color: '#192B32', fontSize: 18, lineHeight: 25, paddingHorizontal: 4, textAlign: 'center', width: '100%' },
  imageSlot: { alignItems: 'center', backgroundColor: '#F7FBFB', borderRadius: 18, height: 220, justifyContent: 'center', overflow: 'hidden', padding: 10, width: '100%' },
  educationalImage: { height: '100%', width: '100%' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' }
});
