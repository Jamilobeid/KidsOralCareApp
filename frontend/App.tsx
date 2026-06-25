import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
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
const RootNavigator = () => {
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
    <View style={styles.root}>
      {renderScreen()}
      {showBottomNav ? <BottomNav /> : null}
      <StatusBar style="dark" />
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
    Baloo2_600SemiBold,
    Nunito_400Regular
  });

  useEffect(() => { configureNotifications(); }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

