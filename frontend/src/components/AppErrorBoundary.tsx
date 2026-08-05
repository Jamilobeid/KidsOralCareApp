import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  recoveryKey: number;
  language: 'en' | 'fr' | 'ar';
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    recoveryKey: 0,
    language: 'en'
  };

  componentDidMount() {
    void AsyncStorage.getItem('eSmile:preferredLanguage').then((language) => {
      if (language === 'en' || language === 'fr' || language === 'ar') {
        this.setState({ language });
      }
    }).catch(() => undefined);
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('The application recovered from a rendering error.', error, info.componentStack);
  }

  private retry = () => {
    this.setState((current) => ({
      hasError: false,
      recoveryKey: current.recoveryKey + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const isFrench = this.state.language === 'fr';
      return (
        <View style={styles.screen}>
          <Text style={styles.icon}>🦷</Text>
          <Text style={styles.title}>{isFrench ? 'Un problème est survenu' : 'Something went wrong'}</Text>
          <Text style={styles.message}>
            {isFrench
              ? 'Les données de ton compte sont toujours en sécurité. Vérifie la connexion Internet, puis essaie de rouvrir l’application.'
              : 'Your account data is still safe. Check your internet connection, then try opening the app again.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFrench ? 'Essayer de rouvrir l’application' : 'Try opening the application again'}
            onPress={this.retry}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>{isFrench ? 'Réessayer' : 'Try again'}</Text>
          </Pressable>
        </View>
      );
    }

    return <React.Fragment key={this.state.recoveryKey}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#EAFBF8',
    flex: 1,
    justifyContent: 'center',
    padding: 32
  },
  icon: { fontSize: 64, marginBottom: 14 },
  title: {
    color: '#16324F',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    color: '#54708A',
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 420,
    textAlign: 'center'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 22,
    justifyContent: 'center',
    marginTop: 26,
    minHeight: 48,
    paddingHorizontal: 34
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
