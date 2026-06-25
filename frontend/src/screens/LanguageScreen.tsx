import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types/app';
import { bodyFont, buttonFont } from '../utils/kidStyle';

const toothImage = require('../../assets/images/shining-tooth.png');

const options: { code: LanguageCode; key: string; native: string; flag: 'en' | 'fr' | 'ar' }[] = [
  { code: 'en', key: 'english', native: 'English', flag: 'en' },
  { code: 'fr', key: 'french', native: 'Francais', flag: 'fr' },
  { code: 'ar', key: 'arabic', native: 'العربية', flag: 'ar' }
];

const FlagBadge = ({ type }: { type: 'en' | 'fr' | 'ar' }) => {
  if (type === 'fr') {
    return (
      <View style={styles.flagBadge}>
        <View style={[styles.flagStripeVertical, { backgroundColor: '#1F4EA3' }]} />
        <View style={[styles.flagStripeVertical, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.flagStripeVertical, { backgroundColor: '#EF3340' }]} />
      </View>
    );
  }

  if (type === 'ar') {
    return (
      <View style={styles.flagBadge}>
        <View style={[styles.flagStripeHorizontal, { backgroundColor: '#ED1C24' }]} />
        <View style={[styles.flagStripeHorizontal, styles.flagMiddle]}>
          <View style={styles.cedarMark} />
        </View>
        <View style={[styles.flagStripeHorizontal, { backgroundColor: '#ED1C24' }]} />
      </View>
    );
  }

  return (
    <View style={[styles.flagBadge, styles.englishFlag]}>
      <View style={styles.englishWhiteHorizontal} />
      <View style={styles.englishWhiteVertical} />
      <View style={styles.englishRedHorizontal} />
      <View style={styles.englishRedVertical} />
    </View>
  );
};

export const LanguageScreen = () => {
  const { t, language, setLanguage, setScreen, theme } = useApp();

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.toothWrap}>
        <View style={[styles.toothGlow, { backgroundColor: theme.secondary }]} />
        <Image source={toothImage} style={styles.toothImage} resizeMode="contain" />
      </View>

      <View style={styles.languageList}>
        {options.map((option) => {
          const selected = language === option.code;
          return (
            <Pressable
              key={option.code}
              accessibilityRole="button"
              accessibilityLabel={t(option.key)}
              onPress={() => setLanguage(option.code)}
              style={[
                styles.languageRow,
                {
                  borderColor: selected ? theme.primary : '#D9E6EE',
                  backgroundColor: selected ? theme.secondary : '#FFFFFF'
                }
              ]}
            >
              <FlagBadge type={option.flag} />
              <View style={styles.languageCopy}>
                <Text style={[buttonFont, styles.languageName, { color: theme.text }]}>{t(option.key)}</Text>
                <Text style={[bodyFont, styles.nativeName, { color: theme.text }]}>{option.native}</Text>
              </View>
              {selected ? <Ionicons name="checkmark" size={25} color={theme.primary} /> : <View style={styles.checkSpace} />}
            </Pressable>
          );
        })}
      </View>

      <AppButton label={t('continueToLogin')} onPress={() => setScreen('auth')} style={styles.continueButton} />
      <Text style={[bodyFont, styles.rtlNote, { color: theme.text }]}>{t('rtlNote')}</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 24
  },
  toothWrap: {
    alignSelf: 'center',
    width: 128,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  toothGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    opacity: 0.9,
    shadowColor: '#44BFE3',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  toothImage: {
    width: 118,
    height: 110
  },
  languageList: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    gap: 12
  },
  languageRow: {
    minHeight: 72,
    borderRadius: 22,
    borderWidth: 2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#17324D',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  languageCopy: { flex: 1 },
  languageName: { fontSize: 18, fontWeight: '900' },
  nativeName: { fontSize: 13, fontWeight: '800', opacity: 0.72, marginTop: 2 },
  checkSpace: { width: 25 },
  flagBadge: {
    width: 42,
    height: 30,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D6E3EA',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF'
  },
  flagStripeVertical: { flex: 1 },
  flagStripeHorizontal: { flex: 1, width: '100%' },
  flagMiddle: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  cedarMark: { width: 12, height: 10, backgroundColor: '#28A745', borderRadius: 2 },
  englishFlag: { backgroundColor: '#1F4EA3', alignItems: 'center', justifyContent: 'center' },
  englishWhiteHorizontal: { position: 'absolute', width: '100%', height: 8, backgroundColor: '#FFFFFF' },
  englishWhiteVertical: { position: 'absolute', width: 8, height: '100%', backgroundColor: '#FFFFFF' },
  englishRedHorizontal: { position: 'absolute', width: '100%', height: 4, backgroundColor: '#EF3340' },
  englishRedVertical: { position: 'absolute', width: 4, height: '100%', backgroundColor: '#EF3340' },
  continueButton: { alignSelf: 'center', width: '100%', maxWidth: 360, marginTop: 4 },
  rtlNote: { alignSelf: 'center', maxWidth: 360, textAlign: 'center', fontSize: 13 }
});

