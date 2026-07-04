import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
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
  iconSize?: number;
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
  language: require('../../assets/images/settings-language-custom.png'),
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
  const selectedBuddy = toothBuddies.find((buddy) => buddy.id === child.selectedCharacter) ?? toothBuddies[0];
  const navigateTo = (screen: RootScreen) => setScreen(screen);

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <Text style={styles.pageTitle}>{t('settings')}</Text>

      <Card style={styles.profileCard}>
        <Animated.View style={[styles.profileAvatar, { transform: [{ translateY: avatarLift }] }]}>
          <View style={styles.profileBuddyGlow} />
          <Ionicons name="sparkles" size={18} color="#FFD85A" style={styles.profileSparkleTop} />
          <Image source={selectedBuddy.image as ImageSourcePropType} style={styles.profileTooth} resizeMode="contain" />
          <Ionicons name="sparkles" size={15} color="#2EC4B6" style={styles.profileSparkleBottom} />
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

      <SettingsCard imageSource={artwork.language} fallbackIcon="language" color="#2EC4B6" background="#E6FFF8" title="Language" subtitle="Choose your favorite language." iconSize={58}>
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

const SettingsCard = ({ imageSource, fallbackIcon, color, background, title, subtitle, children, iconSize = 46 }: SettingsCardProps) => (
  <Card style={styles.settingsCard}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: background }]}>
        <ImageIcon imageSource={imageSource} fallbackIcon={fallbackIcon} color={color} background={background} size={iconSize} />
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
      { borderColor: selected ? color : '#DCEAF1', backgroundColor: selected ? '#EAF7FF' : '#FFFFFF', transform: [{ scale: pressed ? 0.97 : 1 }] }
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
  screen: { gap: 30, paddingBottom: 30 },
  pageTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    lineHeight: 48,
    color: '#41438F',
    textAlign: 'center',
    alignSelf: 'stretch'
  },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 20, backgroundColor: '#FFFFFF', borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  profileAvatar: { width: 126, height: 126, borderRadius: 32, backgroundColor: '#F1FFFC', alignItems: 'center', justifyContent: 'center', overflow: 'visible', shadowColor: '#18D6C1', shadowOpacity: 0.36, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  profileBuddyGlow: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,255,255,0.94)', shadowColor: '#FFD85A', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  profileSparkleTop: { position: 'absolute', top: 9, right: 9, zIndex: 2 },
  profileSparkleBottom: { position: 'absolute', bottom: 13, left: 10, zIndex: 2 },
  profileTooth: { width: 132, height: 132, zIndex: 1 },
  profileCopy: { flex: 1, gap: 8 },
  profileTitle: { color: '#41438F', fontSize: 27, lineHeight: 31, fontFamily: 'Fredoka_700Bold' },
  profileMessage: { color: '#454f59', fontSize: 13, lineHeight: 21, fontFamily: 'Fredoka_700Bold' },
  profileStats: { gap: 8 },
  miniStat: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8 },
  miniStatImage: { width: 38, height: 38 },
  miniStatCopy: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  miniStatLabel: { color: '#000000', fontSize: 14, fontFamily: 'Fredoka_700Bold' },
  miniStatText: { color: '#000000', fontSize: 19, fontFamily: 'Fredoka_700Bold' },
  settingsCard: { gap: 15, backgroundColor: '#ffffff', alignItems: 'center', borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  cardIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: '#41438F', fontSize: 24, lineHeight: 29, fontFamily: 'Fredoka_700Bold' },
  cardSubtitle: { color: '#454f59', fontSize: 13, lineHeight: 21, fontFamily: 'Fredoka_700Bold' },
  cardContent: { gap: 30 },
  toggleRow: { minHeight: 66, width:310, backgroundColor: '#F7FBFF', flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15, borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  smallIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  toggleLabel: { flex: 1, color: '#454f59', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  optionGrid: { gap: 20 },
  optionButton: { minHeight: 58, width:300, backgroundColor: '#F7FBFF', borderRadius: 28, borderWidth: 0, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 15, shadowOffset: { width: 10, height: 10 }, elevation: 10 },
  optionText: { fontSize: 17, fontFamily: 'Fredoka_700Bold' },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F7FFFC', borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  lockedCard: { borderColor: '#f9f9f9', backgroundColor: '#97792d' },
  lockBox: { gap: 20, borderRadius: 22, backgroundColor: '#f8f6f6', padding: 40, borderWidth: 0, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 7  },
  lockQuestion: { color: '#41438F', fontSize: 22, fontFamily: 'Fredoka_700Bold' },
  lockInputRow: { flexDirection: 'row', gap: 8 },
  lockInput: { flex: 1, minHeight: 54, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 0, paddingHorizontal: 14, color: '#41438F', fontSize: 17, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 10, height: 10 }, elevation: 15 },
  unlockButton: { minHeight: 54, borderRadius: 18, backgroundColor: '#454f59', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  unlockText: { color: '#FFFFFF', fontSize: 17, fontFamily: 'Fredoka_700Bold' },
  resetButton: { minHeight: 58, borderRadius: 20, backgroundColor: '#FF6B9A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FBFF', borderRadius: 18, padding: 12, gap: 65 },
  aboutLabel: { color: '#54708A', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  aboutValue: { color: '#16324F', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  aboutButtons: { flexDirection: 'row', gap: 30 },
  aboutButton: { flex: 1, minHeight: 50, borderRadius: 18, backgroundColor: '#d8f9e8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  aboutButtonText: { color: '#168954', fontSize: 15, fontFamily: 'Fredoka_700Bold' }
});
