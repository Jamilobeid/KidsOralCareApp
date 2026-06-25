import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Title } from '../components/Typography';
import { useApp } from '../context/AppContext';
import { LanguageCode, RootScreen } from '../types/app';
import { bodyFont, buttonFont, headingFont, rewardFont } from '../utils/kidStyle';

type IconArtwork = {
  imageSource?: ImageSourcePropType;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
};

type SettingsCardProps = IconArtwork & {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

type ToggleRowProps = IconArtwork & {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color: string;
};

type LinkCardProps = IconArtwork & {
  title: string;
  subtitle: string;
  onPress: () => void;
  locked?: boolean;
};

type MiniStatProps = {
  imageSource: ImageSourcePropType;
  label: string;
  value: string;
  tint: string;
};

const artwork = {
  level: require('../../assets/images/settings-level-cutout.png'),
  stars: require('../../assets/images/settings-stars-cutout.png'),
  badge: require('../../assets/images/settings-badge-cutout.png'),
  reminders: require('../../assets/images/settings-reminders-cutout.png'),
  morning: require('../../assets/images/settings-morning-cutout.png'),
  evening: require('../../assets/images/settings-evening-cutout.png'),
  dailyChallenges: require('../../assets/images/settings-daily-challenges-cutout.png'),
  sounds: require('../../assets/images/settings-sounds-cutout.png'),
  effects: require('../../assets/images/settings-effects-cutout.png'),
  music: require('../../assets/images/settings-music-cutout.png'),
  voice: require('../../assets/images/settings-voice-cutout.png'),
  personalization: require('../../assets/images/settings-personalization-cutout.png'),
  rewards: require('../../assets/images/settings-rewards-cutout.png'),
  parent: require('../../assets/images/settings-parent-cutout.png'),
  screenTime: require('../../assets/images/settings-screen-time-cutout.png'),
  playLimit: require('../../assets/images/settings-play-limit-cutout.png'),
  parentDashboard: require('../../assets/images/settings-parent-dashboard-cutout.png'),
  about: require('../../assets/images/settings-about-cutout.png')
};

const languageOptions: { code: LanguageCode; label: string; emoji: string; color: string }[] = [
  { code: 'en', label: 'English', emoji: '🇬🇧', color: '#2A9DF4' },
  { code: 'fr', label: 'French', emoji: '🇫🇷', color: '#7B61FF' },
  { code: 'ar', label: 'Arabic', emoji: '🇱🇧', color: '#2EC4B6' }
];

export const SettingsScreen = () => {
  const { t, child, language, setLanguage, setScreen } = useApp();
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [dailyChallenges, setDailyChallenges] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [voiceInstructions, setVoiceInstructions] = useState(true);
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true })
      ])
    ).start();
  }, [floatAnim]);

  const avatarLift = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const navigateTo = (screen: RootScreen) => setScreen(screen);

  return (
    <Screen contentContainerStyle={styles.screen}>
      <Title size={38}>{t('settings')}</Title>

      <Card style={styles.profileCard}>
        <Animated.View style={[styles.profileAvatar, { transform: [{ translateY: avatarLift }] }]}>
          <Image source={require('../../assets/images/home-shining-tooth.png')} style={styles.profileTooth} resizeMode="contain" />
        </Animated.View>
        <View style={styles.profileCopy}>
          <Text style={[headingFont, styles.profileTitle]}>Hello, Smile Hero!</Text>
          <Text style={[bodyFont, styles.profileMessage]}>Let's make the app perfect for you!</Text>
          <View style={styles.profileStats}>
            <MiniStat imageSource={artwork.level} label="Level" value={`${child.level}`} tint="#FFF4D6" />
            <MiniStat imageSource={artwork.stars} label="Smile Stars" value={`${child.points}`} tint="#FFF8D9" />
            <MiniStat imageSource={artwork.badge} label="Badges" value={`${child.badges.length}`} tint="#E8F7FF" />
          </View>
        </View>
      </Card>

      <SettingsCard imageSource={artwork.reminders} fallbackIcon="notifications" color="#1D9BF0" background="#E5F6FF" title="Reminders" subtitle="Never miss your brushing time.">
        <ToggleRow imageSource={artwork.morning} fallbackIcon="sunny" label="Morning brushing reminder" value={morningReminder} onValueChange={setMorningReminder} color="#FFB703" background="#FFF5D6" />
        <ToggleRow imageSource={artwork.evening} fallbackIcon="moon" label="Evening brushing reminder" value={eveningReminder} onValueChange={setEveningReminder} color="#7B61FF" background="#F0ECFF" />
        <ToggleRow imageSource={artwork.dailyChallenges} fallbackIcon="flag" label="Daily challenges" value={dailyChallenges} onValueChange={setDailyChallenges} color="#FF6B9A" background="#FFEAF3" />
      </SettingsCard>

      <SettingsCard fallbackIcon="language" color="#2EC4B6" background="#E6FFF8" title="Language" subtitle="Choose your favorite language.">
        <View style={styles.optionGrid}>
          {languageOptions.map((option) => (
            <OptionButton key={option.code} label={`${option.emoji} ${option.label}`} selected={language === option.code} onPress={() => setLanguage(option.code)} color={option.color} />
          ))}
        </View>
      </SettingsCard>

      <SettingsCard imageSource={artwork.sounds} fallbackIcon="musical-notes" color="#FF6B9A" background="#FFEAF3" title="Sounds & Music" subtitle="Make learning fun with audio.">
        <ToggleRow imageSource={artwork.effects} fallbackIcon="sparkles" label="Sound effects" value={soundEffects} onValueChange={setSoundEffects} color="#FFB703" background="#FFF4D6" />
        <ToggleRow imageSource={artwork.music} fallbackIcon="radio" label="Background music" value={backgroundMusic} onValueChange={setBackgroundMusic} color="#7B61FF" background="#F0ECFF" />
        <ToggleRow imageSource={artwork.voice} fallbackIcon="mic" label="Voice instructions" value={voiceInstructions} onValueChange={setVoiceInstructions} color="#2EC4B6" background="#E6FFF8" />
      </SettingsCard>

      <LinkCard imageSource={artwork.personalization} fallbackIcon="color-palette" color="#7B61FF" background="#F0ECFF" title="Personalization" subtitle="Customize your avatar, colors, and characters." onPress={() => navigateTo('personalization')} />

      <LinkCard imageSource={artwork.rewards} fallbackIcon="trophy" color="#FFB703" background="#FFF5D6" title="Rewards" subtitle="View your coins, badges, trophies, and progress." onPress={() => navigateTo('rewards')} />

      <ParentLock />

      <SettingsCard imageSource={artwork.about} fallbackIcon="information-circle" color="#2EC4B6" background="#E6FFF8" title="About" subtitle="App information.">
        <View style={styles.aboutRow}>
          <Text style={[bodyFont, styles.aboutLabel]}>App name</Text>
          <Text style={[rewardFont, styles.aboutValue]}>Kids Oral Care</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[bodyFont, styles.aboutLabel]}>Version</Text>
          <Text style={[rewardFont, styles.aboutValue]}>1.0.0</Text>
        </View>
        <View style={styles.aboutButtons}>
          <Pressable style={styles.aboutButton} onPress={() => Alert.alert('Privacy Policy', 'Privacy policy link can be added here.')}>
            <Text style={[buttonFont, styles.aboutButtonText]}>Privacy Policy</Text>
          </Pressable>
          <Pressable style={styles.aboutButton} onPress={() => Alert.alert('Terms', 'Terms link can be added here.')}>
            <Text style={[buttonFont, styles.aboutButtonText]}>Terms</Text>
          </Pressable>
        </View>
      </SettingsCard>
    </Screen>
  );
};

const ImageIcon = ({ imageSource, fallbackIcon, color, size = 34 }: IconArtwork & { size?: number }) => {
  if (imageSource) return <Image source={imageSource} style={{ width: size, height: size }} resizeMode="contain" />;
  return <Ionicons name={fallbackIcon ?? 'ellipse'} size={Math.round(size * 0.74)} color={color} />;
};

const SettingsCard = ({ imageSource, fallbackIcon, color, background, title, subtitle, children }: SettingsCardProps) => (
  <Card style={styles.settingsCard}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: background }]}>
        <ImageIcon imageSource={imageSource} fallbackIcon={fallbackIcon} color={color} background={background} size={46} />
      </View>
      <View style={styles.cardTitleWrap}>
        <Text style={[headingFont, styles.cardTitle]}>{title}</Text>
        <Text style={[bodyFont, styles.cardSubtitle]}>{subtitle}</Text>
      </View>
    </View>
    {children ? <View style={styles.cardContent}>{children}</View> : null}
  </Card>
);

const ToggleRow = ({ imageSource, fallbackIcon, label, value, onValueChange, color, background }: ToggleRowProps) => (
  <View style={styles.toggleRow}>
    <View style={[styles.smallIcon, { backgroundColor: background }]}>
      <ImageIcon imageSource={imageSource} fallbackIcon={fallbackIcon} color={color} background={background} size={38} />
    </View>
    <Text style={[buttonFont, styles.toggleLabel]}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} thumbColor="#FFFFFF" trackColor={{ false: '#D8E7EF', true: color }} />
  </View>
);

const OptionButton = ({ label, selected, onPress, color }: OptionButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.optionButton,
      { borderColor: selected ? color : '#DCEAF1', backgroundColor: selected ? `${color}22` : '#FFFFFF', transform: [{ scale: pressed ? 0.97 : 1 }] }
    ]}
  >
    <Text style={[buttonFont, styles.optionText, { color: selected ? color : '#16324F' }]}>{label}</Text>
    {selected ? <Ionicons name="checkmark-circle" size={22} color={color} /> : null}
  </Pressable>
);

const LinkCard = ({ imageSource, fallbackIcon, color, background, title, subtitle, onPress, locked }: LinkCardProps) => (
  <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
    <Card style={[styles.linkCard, locked && styles.lockedCard]}>
      <View style={[styles.cardIcon, { backgroundColor: background }]}>
        <ImageIcon imageSource={imageSource} fallbackIcon={locked ? 'lock-closed' : fallbackIcon} color={color} background={background} size={48} />
      </View>
      <View style={styles.cardTitleWrap}>
        <Text style={[headingFont, styles.cardTitle]}>{title}</Text>
        <Text style={[bodyFont, styles.cardSubtitle]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={25} color="#8EA1B2" />
    </Card>
  </Pressable>
);

const ParentLock = () => {
  const { setScreen } = useApp();
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [screenLimit, setScreenLimit] = useState(true);
  const [playLimit, setPlayLimit] = useState(true);

  const checkAnswer = () => {
    if (answer.trim() === '8') {
      setUnlocked(true);
      return;
    }
    Alert.alert('Try again', 'That lock is still closed. Hint: count on your fingers!');
  };

  if (!unlocked) {
    return (
      <SettingsCard imageSource={artwork.parent} fallbackIcon="shield-checkmark" color="#31C778" background="#E9FFF4" title="Parent Zone" subtitle="Manage safety and progress.">
        <View style={styles.lockBox}>
          <Text style={[headingFont, styles.lockQuestion]}>Parent lock: 3 + 5 = ?</Text>
          <View style={styles.lockInputRow}>
            <TextInput value={answer} onChangeText={setAnswer} keyboardType="number-pad" placeholder="Answer" placeholderTextColor="#93A6B5" style={[bodyFont, styles.lockInput]} />
            <Pressable onPress={checkAnswer} style={styles.unlockButton}>
              <Text style={[buttonFont, styles.unlockText]}>Unlock</Text>
            </Pressable>
          </View>
        </View>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard imageSource={artwork.parent} fallbackIcon="shield-checkmark" color="#31C778" background="#E9FFF4" title="Parent Zone" subtitle="Unlocked. Manage safety and progress.">
      <ToggleRow imageSource={artwork.screenTime} fallbackIcon="phone-portrait" label="Screen time limit" value={screenLimit} onValueChange={setScreenLimit} color="#7B61FF" background="#F0ECFF" />
      <ToggleRow imageSource={artwork.playLimit} fallbackIcon="game-controller" label="Daily play limit" value={playLimit} onValueChange={setPlayLimit} color="#1D9BF0" background="#E5F6FF" />
      <LinkCard imageSource={artwork.parentDashboard} fallbackIcon="clipboard" color="#1D9BF0" background="#E5F6FF" title="Open Parent Dashboard" subtitle="See brushing progress and reminders." onPress={() => setScreen('parentDashboard')} />
      <Pressable style={styles.resetButton} onPress={() => Alert.alert('Reset rewards', 'Reward reset can be connected when parent accounts are ready.')}>
        <Ionicons name="refresh" size={22} color="#FFFFFF" />
        <Text style={[buttonFont, styles.resetText]}>Reset rewards</Text>
      </Pressable>
    </SettingsCard>
  );
};

const MiniStat = ({ imageSource, label, value, tint }: MiniStatProps) => (
  <View style={[styles.miniStat, { backgroundColor: tint }]}>
    <Image source={imageSource} style={styles.miniStatImage} resizeMode="contain" />
    <View style={styles.miniStatCopy}>
      <Text style={[bodyFont, styles.miniStatLabel]}>{label}</Text>
      <Text style={[rewardFont, styles.miniStatText]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { gap: 16, paddingBottom: 30 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF', borderColor: '#8FE9F2' },
  profileAvatar: { width: 108, height: 108, borderRadius: 32, backgroundColor: '#E8FFF8', alignItems: 'center', justifyContent: 'center' },
  profileTooth: { width: 94, height: 94 },
  profileCopy: { flex: 1, gap: 8 },
  profileTitle: { color: '#16324F', fontSize: 27, lineHeight: 31, fontWeight: '900' },
  profileMessage: { color: '#33546E', fontSize: 16, lineHeight: 21, fontStyle: 'italic' },
  profileStats: { gap: 8 },
  miniStat: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8 },
  miniStatImage: { width: 38, height: 38 },
  miniStatCopy: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  miniStatLabel: { color: '#54708A', fontSize: 14, fontWeight: '800', fontStyle: 'italic' },
  miniStatText: { color: '#16324F', fontSize: 19, fontWeight: '900' },
  settingsCard: { gap: 12, backgroundColor: '#FFFFFF' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  cardIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: '#16324F', fontSize: 24, lineHeight: 29, fontWeight: '900' },
  cardSubtitle: { color: '#54708A', fontSize: 16, lineHeight: 21, fontStyle: 'italic' },
  cardContent: { gap: 10 },
  toggleRow: { minHeight: 66, borderRadius: 22, backgroundColor: '#F7FBFF', flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12 },
  smallIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  toggleLabel: { flex: 1, color: '#16324F', fontSize: 16, fontWeight: '900' },
  optionGrid: { gap: 10 },
  optionButton: { minHeight: 58, borderRadius: 20, borderWidth: 2, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 17, fontWeight: '900' },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#FFFFFF' },
  lockedCard: { borderColor: '#FFE0A6', backgroundColor: '#FFF9EA' },
  lockBox: { gap: 12, borderRadius: 22, backgroundColor: '#FFF9EA', padding: 14 },
  lockQuestion: { color: '#16324F', fontSize: 20, fontWeight: '900' },
  lockInputRow: { flexDirection: 'row', gap: 10 },
  lockInput: { flex: 1, minHeight: 54, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFE0A6', paddingHorizontal: 14, color: '#16324F', fontSize: 17 },
  unlockButton: { minHeight: 54, borderRadius: 18, backgroundColor: '#FFB703', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  unlockText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  resetButton: { minHeight: 58, borderRadius: 20, backgroundColor: '#FF6B9A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FBFF', borderRadius: 18, padding: 12 },
  aboutLabel: { color: '#54708A', fontSize: 16, fontStyle: 'italic' },
  aboutValue: { color: '#16324F', fontSize: 16, fontWeight: '900' },
  aboutButtons: { flexDirection: 'row', gap: 10 },
  aboutButton: { flex: 1, minHeight: 50, borderRadius: 18, backgroundColor: '#E9FFF4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  aboutButtonText: { color: '#168954', fontSize: 15, fontWeight: '900' }
});
