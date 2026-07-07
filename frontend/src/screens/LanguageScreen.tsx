import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types/app';
import { bodyFont, headingFont } from '../utils/kidStyle';

const globeImage = require('../../assets/images/language-globe-cutout.png');
const ukFlagImage = require('../../assets/images/language-flag-uk.png');
const frenchFlagImage = require('../../assets/images/language-flag-france.png');
const lebaneseFlagImage = require('../../assets/images/language-flag-lebanon.png');

const languageOptions: { code: LanguageCode; labelKey: string; flag: ImageSourcePropType }[] = [
  { code: 'en', labelKey: 'english', flag: ukFlagImage },
  { code: 'fr', labelKey: 'french', flag: frenchFlagImage },
  { code: 'ar', labelKey: 'arabic', flag: lebaneseFlagImage }
];

export const LanguageScreen = () => {
  const { setLanguage, setScreen, t } = useApp();

  const chooseLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setScreen('welcome');
  };

  return (
    <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[headingFont, styles.title]}>{t('languageHeading')}</Text>
            <Image accessibilityLabel="Smiling earth globe" source={globeImage} style={styles.globe} resizeMode="contain" />
          </View>

          <View style={styles.languagePanel}>
            <Text style={[bodyFont, styles.subtitle]}>{t('chooseLanguage')}</Text>

            <View style={styles.buttonGroup}>
              {languageOptions.map((option) => (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('choose')} ${t(option.labelKey)}`}
                  onPress={() => chooseLanguage(option.code)}
                  style={({ pressed }) => [styles.languageButton, pressed && styles.languageButtonPressed]}
                >
                  <Image source={option.flag} style={styles.flagImage} resizeMode="contain" />
                  <Text style={[headingFont, styles.languageLabel]}>{t(option.labelKey)}</Text>
                </Pressable>
              ))}
            </View>
            </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28
  },
  languagePanel: {
    alignSelf: 'stretch',
    backgroundColor: '#F7FBFF',
    borderRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 34,
    gap: 17,
    shadowColor: '#17324D',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 15
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 22
  },
  title: {
    color: '#41438F',
    fontSize: 51,
    lineHeight: 58
  },
  globe: {
    height: 70,
    marginTop: 4,
    width: 76
  },
  subtitle: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 27,
    marginBottom: 36,
    marginLeft: 18,
    fontFamily: 'Fredoka_700Bold'
  },
  buttonGroup: {
    gap: 28
  },
  languageButton: {
    alignItems: 'center',
    backgroundColor: '#168FE0',
    borderRadius: 21,
    flexDirection: 'row',
    height: 65,
    paddingLeft: 30,
    paddingRight: 24,
    shadowColor: '#1674B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3
  },
  languageButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  languageLabel: {
    color: '#030303',
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    marginLeft: 43,
    textAlign: 'left'
  },
  flagImage: {
    height: 44,
    width: 58
  }
});
