import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { toothBuddies } from '../data/toothBuddies';
import { PasswordVisibilityIcon } from '../components/PasswordVisibilityIcon';
import { LanguageCode, RootScreen } from '../types/app';
import { bodyFont, buttonFont, headingFont, rewardFont } from '../utils/kidStyle';
import { getDisplayUsername } from '../utils/displayUsername';

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
  levels: [
    require('../../assets/images/settings-level-1.png'),
    require('../../assets/images/settings-level-2.png'),
    require('../../assets/images/settings-level-3.png'),
    require('../../assets/images/settings-level-4.png'),
    require('../../assets/images/settings-level-5.png')
  ],
  stars: require('../../assets/images/settings-stars-cutout.png'),
  badge: require('../../assets/images/settings-badge-cutout.png'),
  reminders: require('../../assets/images/settings-reminders-cutout.png'),
  morning: require('../../assets/images/settings-morning-cutout.png'),
  evening: require('../../assets/images/settings-evening-cutout.png'),
  sounds: require('../../assets/images/settings-sounds-cutout.png'),
  music: require('../../assets/images/settings-music-cutout.png'),
  voice: require('../../assets/images/settings-voice-cutout.png'),
  personalization: require('../../assets/images/settings-personalization-cutout.png'),
  rewards: require('../../assets/images/settings-rewards-cutout.png'),
  language: require('../../assets/images/settings-language-custom.png'),
  parent: require('../../assets/images/settings-parent-cutout.png'),
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
  const { t, child, isAdmin, language, setLanguage, setScreen, backgroundMusicEnabled, setBackgroundMusicEnabled, brushingSignLanguageVideosEnabled, setBrushingSignLanguageVideosEnabled } = useApp();
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
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
          <Text style={[headingFont, styles.profileTitle]}>{t('profileGreeting').replace('{{name}}', getDisplayUsername(child.nickname))}</Text>
          <View style={styles.profileStats}>
            <MiniStat imageSource={artwork.levels[Math.min(Math.max(child.level, 1), 5) - 1]} label={t('level')} value={`${child.level}`} tint="#FFF4D6" />
            <MiniStat imageSource={artwork.stars} label={t('smileStars')} value={`${child.points}`} tint="#FFF8D9" />
            <MiniStat imageSource={artwork.badge} label={t('badges')} value={`${child.badges.length}`} tint="#E8F7FF" />
          </View>
        </View>
      </Card>

      <SettingsCard imageSource={artwork.reminders} fallbackIcon="notifications" color="#1D9BF0" background="#E5F6FF" title={t('reminders')} subtitle={t('remindersSubtitle')}>
        <ToggleRow imageSource={artwork.morning} fallbackIcon="sunny" label={t('morningReminder')} value={morningReminder} onValueChange={setMorningReminder} color="#FFB703" background="#FFF5D6" />
        <ToggleRow imageSource={artwork.evening} fallbackIcon="moon" label={t('eveningReminder')} value={eveningReminder} onValueChange={setEveningReminder} color="#7B61FF" background="#F0ECFF" />
      </SettingsCard>

      <SettingsCard imageSource={artwork.language} fallbackIcon="language" color="#2EC4B6" background="#E6FFF8" title={t('language')} subtitle={t('languageSubtitleSettings')} iconSize={58}>
        <View style={styles.optionGrid}>
          {languageOptions.map((option) => (
            <OptionButton
              key={option.code}
              label={`${option.emoji} ${t(option.code === 'en' ? 'english' : option.code === 'fr' ? 'french' : 'arabic')}`}
              selected={language === option.code}
              onPress={() => setLanguage(option.code)}
              color={option.color}
            />
          ))}
        </View>
      </SettingsCard>

      <SettingsCard imageSource={artwork.sounds} fallbackIcon="musical-notes" color="#FF6B9A" background="#FFEAF3" title={t('soundsMusic')} subtitle={t('soundsMusicSubtitle')}>
        <ToggleRow imageSource={artwork.music} fallbackIcon="radio" label={t('backgroundMusic')} value={backgroundMusicEnabled} onValueChange={setBackgroundMusicEnabled} color="#7B61FF" background="#F0ECFF" />
      </SettingsCard>

      <SettingsCard imageSource={artwork.voice} fallbackIcon="accessibility" color="#2EC4B6" background="#E6FFF8" title={t('brushingAccessibility')} subtitle={t('brushingAccessibilitySubtitle')}>
        <ToggleRow fallbackIcon="videocam" label={t('brushingSignLanguageVideos')} value={brushingSignLanguageVideosEnabled} onValueChange={setBrushingSignLanguageVideosEnabled} color="#2EC4B6" background="#E6FFF8" />
      </SettingsCard>

      <LinkCard imageSource={artwork.personalization} fallbackIcon="color-palette" color="#7B61FF" background="#F0ECFF" title={t('personalization')} subtitle={t('personalizationSubtitle')} onPress={() => navigateTo('personalization')} />

      <LinkCard imageSource={artwork.rewards} fallbackIcon="trophy" color="#FFB703" background="#FFF5D6" title={t('rewards')} subtitle={t('rewardsSubtitle')} onPress={() => navigateTo('rewards')} />

      <ParentLock />

      <SettingsCard imageSource={artwork.about} fallbackIcon="information-circle" color="#2EC4B6" background="#E6FFF8" title={t('about')} subtitle={t('aboutSubtitle')}>
        <View style={styles.aboutRow}>
          <Text style={[bodyFont, styles.aboutLabel]}>{t('appNameLabel')}</Text>
          <Text style={[rewardFont, styles.aboutValue]}>eSmile</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[bodyFont, styles.aboutLabel]}>{t('version')}</Text>
          <Text style={[rewardFont, styles.aboutValue]}>1.0.0</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigateTo('legalInformation')} style={styles.legalButton}>
          <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
          <Text style={[buttonFont, styles.legalButtonText]}>{t('openLegalInformation')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
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
  const { deleteAccountAndData, signOutAccount, leaveLeaderboard, leaderboardParticipating, isAdmin, isFirebaseReady, setScreen, t } = useApp();
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [playLimit, setPlayLimit] = useState(true);
  const [showDeletion, setShowDeletion] = useState(false);
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [showDeletionPassword, setShowDeletionPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [leavingLeaderboard, setLeavingLeaderboard] = useState(false);
  const zoneTitle = isAdmin ? t('adminZone') : t('parentZone');
  const lockQuestion = isAdmin ? t('adminLockQuestion') : t('parentLockQuestion');

  const checkAnswer = () => {
    if (answer.trim() === '8') {
      setUnlocked(true);
      return;
    }
    Alert.alert(t('tryAgain'), isAdmin ? t('adminLockWrong') : t('parentLockWrong'));
  };

  const submitDeletion = async () => {
    if (deleting) return;
    setDeleting(true);
    const deleted = await deleteAccountAndData(deletionPassword, deletionConfirmation);
    setDeleting(false);
    if (deleted) {
      setDeletionPassword('');
      setDeletionConfirmation('');
      setShowDeletion(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(t('signOutTitle'), t('signOutMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          if (signingOut) return;
          setSigningOut(true);
          await signOutAccount();
          setSigningOut(false);
        }
      }
    ]);
  };

  const confirmLeaderboardRemoval = () => {
    Alert.alert(t('leaveLeaderboardTitle'), t('leaveLeaderboardMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('removeMyProfile'),
        style: 'destructive',
        onPress: async () => {
          if (leavingLeaderboard) return;
          setLeavingLeaderboard(true);
          const removed = await leaveLeaderboard();
          setLeavingLeaderboard(false);
          if (removed) Alert.alert(t('leaderboardProfileRemoved'), t('leaderboardProfileRemovedMessage'));
        }
      }
    ]);
  };

  if (!unlocked) {
    return (
      <SettingsCard imageSource={artwork.parent} fallbackIcon="shield-checkmark" color="#31C778" background="#E9FFF4" title={zoneTitle} subtitle={t('parentZoneSubtitle')}>
        <View style={styles.lockBox}>
          <Text style={[headingFont, styles.lockQuestion]}>{lockQuestion}</Text>
          <View style={styles.lockInputRow}>
            <TextInput value={answer} onChangeText={setAnswer} keyboardType="number-pad" placeholder={t('answer')} placeholderTextColor="#93A6B5" style={[bodyFont, styles.lockInput]} />
            <Pressable onPress={checkAnswer} style={styles.unlockButton}>
              <Text style={[buttonFont, styles.unlockText]}>{t('unlock')}</Text>
            </Pressable>
          </View>
        </View>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard imageSource={artwork.parent} fallbackIcon="shield-checkmark" color="#31C778" background="#E9FFF4" title={zoneTitle} subtitle={t('parentZoneUnlockedSubtitle')}>
      <ToggleRow imageSource={artwork.playLimit} fallbackIcon="game-controller" label={t('dailyPlayLimit')} value={playLimit} onValueChange={setPlayLimit} color="#1D9BF0" background="#E5F6FF" />
      <LinkCard
        imageSource={artwork.parentDashboard}
        fallbackIcon="clipboard"
        color="#1D9BF0"
        background="#E5F6FF"
        title={isAdmin ? t('adminDashboard') : t('openParentDashboard')}
        subtitle={isAdmin ? t('adminDashboardSubtitle') : t('openParentDashboardSubtitle')}
        onPress={() => setScreen(isAdmin ? 'adminDashboard' : 'parentDashboard')}
      />
      {!isAdmin ? (
        <View style={styles.leaderboardControl}>
          <View style={styles.signOutCopy}>
            <Ionicons name={leaderboardParticipating ? 'trophy' : 'eye-off'} size={24} color="#7B61FF" />
            <View style={styles.dangerCopy}>
              <Text style={[headingFont, styles.leaderboardControlTitle]}>{t('leaderboardPrivacyControl')}</Text>
              <Text style={[bodyFont, styles.leaderboardControlText]}>
                {t(leaderboardParticipating ? 'leaderboardCurrentlyVisible' : 'leaderboardCurrentlyPrivate')}
              </Text>
            </View>
          </View>
          {leaderboardParticipating ? (
            <Pressable disabled={leavingLeaderboard} onPress={confirmLeaderboardRemoval} style={[styles.leaveLeaderboardButton, leavingLeaderboard && styles.disabledButton]}>
              <Ionicons name="eye-off-outline" size={20} color="#FFFFFF" />
              <Text style={[buttonFont, styles.leaveLeaderboardText]}>{leavingLeaderboard ? t('removing') : t('removeFromLeaderboard')}</Text>
            </Pressable>
          ) : (
            <Text style={[bodyFont, styles.rejoinText]}>{t('leaderboardRejoinHelp')}</Text>
          )}
        </View>
      ) : null}
      <View style={styles.signOutZone}>
        <View style={styles.signOutCopy}>
          <Ionicons name="log-out-outline" size={24} color="#41438F" />
          <View style={styles.dangerCopy}>
            <Text style={[headingFont, styles.signOutTitle]}>{t('signOut')}</Text>
            <Text style={[bodyFont, styles.signOutDescription]}>{t('signOutDescription')}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('signOut')}
          disabled={signingOut}
          onPress={confirmSignOut}
          style={[styles.signOutButton, signingOut && styles.disabledButton]}
        >
          <Ionicons name="log-out-outline" size={21} color="#FFFFFF" />
          <Text style={[buttonFont, styles.signOutButtonText]}>{signingOut ? t('signingOut') : t('signOut')}</Text>
        </Pressable>
      </View>
      {!isAdmin ? (
        <View style={styles.dangerZone}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning" size={24} color="#B4233A" />
            <View style={styles.dangerCopy}>
              <Text style={[headingFont, styles.dangerTitle]}>{t('deleteAccountData')}</Text>
              <Text style={[bodyFont, styles.dangerDescription]}>{t('deleteAccountDescription')}</Text>
            </View>
          </View>

          {!showDeletion ? (
            <Pressable
              accessibilityRole="button"
              disabled={!isFirebaseReady}
              onPress={() => setShowDeletion(true)}
              style={[styles.openDeleteButton, !isFirebaseReady && styles.disabledButton]}
            >
              <Text style={[buttonFont, styles.openDeleteText]}>{isFirebaseReady ? t('startAccountDeletion') : t('deletionRequiresFirebase')}</Text>
            </Pressable>
          ) : (
            <View style={styles.deleteForm}>
              <Text style={[bodyFont, styles.deleteWarning]}>{t('deleteWarning')}</Text>
              <View style={styles.deletePasswordRow}>
                <TextInput
                  value={deletionPassword}
                  onChangeText={setDeletionPassword}
                  editable={!deleting}
                  secureTextEntry={!showDeletionPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('parentPassword')}
                  placeholderTextColor="#8A96A8"
                  style={[bodyFont, styles.deletePasswordInput]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showDeletionPassword ? t('hidePassword') : t('showPassword')}
                  onPress={() => setShowDeletionPassword((current) => !current)}
                  hitSlop={10}
                  style={styles.deleteEyeButton}
                >
                  <PasswordVisibilityIcon hidden={!showDeletionPassword} />
                </Pressable>
              </View>
              <TextInput
                value={deletionConfirmation}
                onChangeText={setDeletionConfirmation}
                editable={!deleting}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder={t('typeDelete')}
                placeholderTextColor="#8A96A8"
                style={[bodyFont, styles.deleteConfirmInput]}
              />
              <View style={styles.deleteActions}>
                <Pressable
                  disabled={deleting}
                  onPress={() => {
                    setShowDeletion(false);
                    setDeletionPassword('');
                    setDeletionConfirmation('');
                  }}
                  style={styles.cancelDeleteButton}
                >
                  <Text style={[buttonFont, styles.cancelDeleteText]}>{t('cancel')}</Text>
                </Pressable>
                <Pressable
                  disabled={deleting || !deletionPassword || deletionConfirmation !== 'DELETE'}
                  onPress={submitDeletion}
                  style={[styles.confirmDeleteButton, (deleting || !deletionPassword || deletionConfirmation !== 'DELETE') && styles.disabledButton]}
                >
                  <Text style={[buttonFont, styles.confirmDeleteText]}>{deleting ? t('deleting') : t('deletePermanently')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ) : null}
      <Pressable style={styles.resetButton} onPress={() => Alert.alert(t('resetRewards'), t('resetRewardsMessage'))}>
        <Ionicons name="refresh" size={22} color="#FFFFFF" />
        <Text style={[buttonFont, styles.resetText]}>{t('resetRewards')}</Text>
      </Pressable>
    </SettingsCard>
  );
};

const MiniStat = ({ imageSource, label, value, tint }: MiniStatProps) => (
  <View style={[styles.miniStat, { backgroundColor: tint }]}>
    <Image source={imageSource} style={styles.miniStatImage} resizeMode="contain" />
    <View style={styles.miniStatCopy}>
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={[bodyFont, styles.miniStatLabel]}>{label}</Text>
      <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={[rewardFont, styles.miniStatText]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: { gap: 30, paddingBottom: 30 },
  pageTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    lineHeight: 40,
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
  profileCopy: { flex: 1, gap: 8, minWidth: 0 },
  profileTitle: { color: '#41438F', fontSize: 27, lineHeight: 31, fontFamily: 'Fredoka_700Bold' },
  profileMessage: { color: '#454f59', fontSize: 13, lineHeight: 21, fontFamily: 'Fredoka_700Bold' },
  profileStats: { gap: 8 },
  miniStat: { minHeight: 54, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 18, paddingHorizontal: 8, paddingVertical: 8, overflow: 'hidden' },
  miniStatImage: { width: 36, height: 36, flexShrink: 0 },
  miniStatCopy: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 5 },
  miniStatLabel: { flex: 1, minWidth: 0, color: '#000000', fontSize: 12, fontFamily: 'Fredoka_700Bold' },
  miniStatText: { flexShrink: 0, maxWidth: '38%', color: '#000000', fontSize: 17, fontFamily: 'Fredoka_700Bold', textAlign: 'right' },
  settingsCard: { gap: 15, backgroundColor: '#ffffff', alignItems: 'center', borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  cardIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: '#41438F', fontSize: 24, lineHeight: 29, fontFamily: 'Fredoka_700Bold' },
  cardSubtitle: { color: '#454f59', fontSize: 11, lineHeight: 21, fontFamily: 'Fredoka_700Bold' },
  cardContent: { gap: 30 },
  toggleRow: { minHeight: 66, width:310, backgroundColor: '#F7FBFF', flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15, borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  smallIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  toggleLabel: { flex: 1, color: '#454f59', fontSize: 13, fontFamily: 'Fredoka_700Bold' },
  optionGrid: { gap: 20 },
  optionButton: { minHeight: 58, width:300, backgroundColor: '#F7FBFF', borderRadius: 28, borderWidth: 0, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 15, shadowOffset: { width: 10, height: 10 }, elevation: 10 },
  optionText: { fontSize: 17, fontFamily: 'Fredoka_700Bold' },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F7FFFC', borderWidth: 0, borderRadius: 28, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  lockedCard: { borderColor: '#f9f9f9', backgroundColor: '#97792d' },
  lockBox: { width: '90%', alignSelf: 'center', gap: 16, borderRadius: 20, backgroundColor: '#f8f6f6', paddingHorizontal: 16, paddingVertical: 22, borderWidth: 0, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 7 },
  lockQuestion: { color: '#41438F', fontSize: 20, lineHeight: 25 },
  lockInputRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 7 },
  lockInput: { flex: 1, minHeight: 48, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 0, paddingHorizontal: 13, color: '#41438F', fontSize: 16, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 10, height: 10 }, elevation: 15 },
  unlockButton: { minHeight: 48, width: 76, borderRadius: 16, backgroundColor: '#454f59', alignItems: 'center', justifyContent: 'center' },
  unlockText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20 },
  dangerZone: { width: 310, gap: 15, borderRadius: 24, backgroundColor: '#FFF2F4', borderWidth: 2, borderColor: '#FFC7D0', padding: 18 },
  signOutZone: { width: 310, gap: 14, borderRadius: 24, backgroundColor: '#F3F2FF', borderWidth: 2, borderColor: '#D8D5FF', padding: 18 },
  leaderboardControl: { width: 310, gap: 14, marginTop: 15, borderRadius: 24, backgroundColor: '#F7F3FF', borderWidth: 2, borderColor: '#DDD2FF', padding: 18 },
  leaderboardControlTitle: { color: '#5D3FC0', fontSize: 19, lineHeight: 24 },
  leaderboardControlText: { color: '#594F75', fontSize: 12, lineHeight: 18 },
  leaveLeaderboardButton: { alignItems: 'center', backgroundColor: '#7B61FF', borderRadius: 16, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  leaveLeaderboardText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, textAlign: 'center' },
  rejoinText: { color: '#594F75', fontSize: 11, lineHeight: 17 },
  signOutCopy: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  signOutTitle: { color: '#41438F', fontSize: 19, lineHeight: 24 },
  signOutDescription: { color: '#4D4E75', fontSize: 12, lineHeight: 18 },
  signOutButton: { minHeight: 50, borderRadius: 16, backgroundColor: '#41438F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  signOutButtonText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20 },
  dangerHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dangerCopy: { flex: 1, gap: 5 },
  dangerTitle: { color: '#9B1C31', fontSize: 19, lineHeight: 24 },
  dangerDescription: { color: '#67313A', fontSize: 12, lineHeight: 18 },
  openDeleteButton: { minHeight: 48, borderRadius: 16, backgroundColor: '#B4233A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  openDeleteText: { color: '#FFFFFF', fontSize: 14, lineHeight: 19, textAlign: 'center' },
  deleteForm: { gap: 13 },
  deleteWarning: { color: '#7A2332', fontSize: 13, lineHeight: 19 },
  deletePasswordRow: { minHeight: 50, borderRadius: 15, borderWidth: 1.5, borderColor: '#D796A2', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingLeft: 13 },
  deletePasswordInput: { flex: 1, color: '#17324D', fontSize: 15, paddingVertical: 10 },
  deleteEyeButton: { width: 38, height: 38, marginRight: 6, borderRadius: 19, borderWidth: 1, borderColor: '#C9C4FF', backgroundColor: '#ECEAFF', alignItems: 'center', justifyContent: 'center' },
  deleteConfirmInput: { minHeight: 50, borderRadius: 15, borderWidth: 1.5, borderColor: '#D796A2', backgroundColor: '#FFFFFF', color: '#17324D', fontSize: 15, paddingHorizontal: 13 },
  deleteActions: { flexDirection: 'row', gap: 10 },
  cancelDeleteButton: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1.5, borderColor: '#AAB8C2', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  cancelDeleteText: { color: '#455A68', fontSize: 14 },
  confirmDeleteButton: { flex: 1.45, minHeight: 48, borderRadius: 16, backgroundColor: '#B4233A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  confirmDeleteText: { color: '#FFFFFF', fontSize: 13, textAlign: 'center' },
  disabledButton: { opacity: 0.48 },
  resetButton: { minHeight: 58, borderRadius: 20, backgroundColor: '#FF6B9A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FBFF', borderRadius: 18, padding: 12, gap: 65 },
  aboutLabel: { color: '#54708A', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  aboutValue: { color: '#16324F', fontSize: 16, fontFamily: 'Fredoka_700Bold' },
  legalButton: { alignItems: 'center', backgroundColor: '#41438F', borderRadius: 18, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 58, paddingHorizontal: 14, paddingVertical: 8 },
  legalButtonText: { color: '#FFFFFF', flex: 1, fontSize: 13, lineHeight: 17, textAlign: 'center' }
});
