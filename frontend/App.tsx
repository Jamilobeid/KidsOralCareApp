import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNav } from './src/components/BottomNav';
import { AppProvider, useApp } from './src/context/AppContext';
import { configureNotifications } from './src/services/reminders';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { BrushingTimerScreen } from './src/screens/BrushingTimerScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { ChildHomeScreen } from './src/screens/ChildHomeScreen';
import { GamesScreen } from './src/screens/GamesScreen';
import { LanguageScreen } from './src/screens/LanguageScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';
import { PersonalizationScreen } from './src/screens/PersonalizationScreen';
import { RewardsScreen } from './src/screens/RewardsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
const RootNavigator = ({ previewInset = false }: { previewInset?: boolean }) => {
  const { screen } = useApp();
  const showBottomNav = !['welcome', 'auth', 'language'].includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return <WelcomeScreen />;
      case 'auth': return <AuthScreen />;
      case 'brushing': return <BrushingTimerScreen />;
      case 'games': return <GamesScreen />;
      case 'rewards': return <RewardsScreen />;
      case 'challenges': return <ChallengesScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'personalization': return <PersonalizationScreen />;
      case 'parentDashboard': return <ParentDashboardScreen />;
      case 'adminDashboard': return <AdminDashboardScreen />;
      case 'settings': return <SettingsScreen />;
      case 'language': return <LanguageScreen />;
      case 'childHome':
      default: return <ChildHomeScreen />;
    }
  };

  return (
    <View style={[styles.root, previewInset ? styles.webContentInset : undefined]}>
      {renderScreen()}
      {showBottomNav ? <BottomNav /> : null}
      <StatusBar style="dark" />
    </View>
  );
};

const PhoneStatusBar = () => (
  <View style={styles.phoneStatusBar}>
    <Text style={styles.phoneTime}>9:41</Text>
    <View style={styles.phoneSpeaker} />
    <View style={styles.phoneIndicators}>
      <View style={styles.signalBars}>
        <View style={[styles.signalBar, styles.signalBarShort]} />
        <View style={[styles.signalBar, styles.signalBarMedium]} />
        <View style={styles.signalBar} />
      </View>
      <Text style={styles.wifiIcon}>⌁</Text>
      <View style={styles.battery}>
        <View style={styles.batteryFill} />
      </View>
      <View style={styles.batteryTip} />
    </View>
  </View>
);

export default function App() {
  useFonts({
    Fredoka_700Bold,
    Baloo2_600SemiBold,
    Nunito_400Regular
  });

  useEffect(() => { configureNotifications(); }, []);

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

const AppShell = () => {
  const { theme } = useApp();
  const { width, height } = useWindowDimensions();
  const showPhoneFrame = Platform.OS === 'web' && width >= 700;
  const phoneFrameStyle = showPhoneFrame
    ? [
        styles.phoneFrame,
        {
          backgroundColor: theme.gradient[0],
          height: Math.min(height - 48, 932),
          minHeight: Math.min(height - 48, 720)
        }
      ]
    : styles.mobileFrame;

  return (
    <View style={showPhoneFrame ? styles.webPreviewPage : styles.appPage}>
      <View style={phoneFrameStyle}>
        {showPhoneFrame ? <PhoneStatusBar /> : null}
        <View style={styles.mobileFrame}>
          <SafeAreaProvider>
            <RootNavigator previewInset={showPhoneFrame} />
          </SafeAreaProvider>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appPage: { flex: 1 },
  root: { flex: 1 },
  webPreviewPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEAE3',
    padding: 24
  },
  mobileFrame: { flex: 1 },
  webContentInset: {
    paddingTop: 54
  },
  phoneFrame: {
    width: 430,
    maxWidth: '100%',
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: '#44D0C4',
    borderColor: 'rgba(23, 50, 77, 0.12)',
    borderWidth: 1,
    shadowColor: '#17324D',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 }
  },
  phoneStatusBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 54,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  phoneTime: {
    position: 'absolute',
    left: 36,
    top: 19,
    color: '#061115',
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    fontWeight: '800'
  },
  phoneSpeaker: {
    position: 'absolute',
    top: 11,
    width: 126,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#000000'
  },
  phoneIndicators: {
    position: 'absolute',
    right: 34,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  signalBars: {
    height: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2
  },
  signalBar: {
    width: 3,
    height: 11,
    borderRadius: 2,
    backgroundColor: '#061115'
  },
  signalBarShort: {
    height: 6
  },
  signalBarMedium: {
    height: 9
  },
  wifiIcon: {
    color: '#061115',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 15,
    transform: [{ rotate: '90deg' }]
  },
  battery: {
    width: 22,
    height: 11,
    borderWidth: 1.5,
    borderColor: '#061115',
    borderRadius: 3,
    padding: 1
  },
  batteryFill: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#061115'
  },
  batteryTip: {
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#061115',
    marginLeft: -5
  }
});


