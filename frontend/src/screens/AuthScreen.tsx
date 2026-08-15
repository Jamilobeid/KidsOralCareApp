import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { useApp } from '../context/AppContext';
import { LegalDocumentId } from '../data/legalDocuments';
import { bodyFont, headingFont } from '../utils/kidStyle';
import { appAlert as Alert } from '../utils/appAlert';
import { PasswordVisibilityIcon } from '../components/PasswordVisibilityIcon';

const bubbleToothImage = require('../../assets/images/login-tooth-bubbles-cutout.png');
const bowToothImage = require('../../assets/images/login-tooth-bow-cutout.png');
const signupSparkleToothImage = require('../../assets/images/signup-tooth-sparkle-cutout.png');
const signupBrushToothImage = require('../../assets/images/signup-tooth-brush-cutout.png');

export const AuthScreen = () => {
  const {
    t, authMode, signInChild, registerParent,
    verificationPending, verificationEmailMasked, consentPending, childSetupPending, checkParentEmailVerification,
    submitParentalConsent, completeChildSetup,
    resendVerificationEmail, cancelVerification, requestPasswordReset
  } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [age, setAge] = useState(6);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [parentLegalName, setParentLegalName] = useState('');
  const [consentSignature, setConsentSignature] = useState('');
  const [leaderboardRequested, setLeaderboardRequested] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [openLegalDocument, setOpenLegalDocument] = useState<LegalDocumentId | null>(null);
  const isSignup = authMode === 'signup';

  React.useEffect(() => {
    if (isSignup) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setParentEmail('');
      setAge(4);
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
    }
  }, [isSignup]);

  const validateSignup = () => {
    const cleanPassword = password.trim();

    if (cleanPassword.length < 6 || cleanPassword.length > 20) {
      Alert.alert(t('passwordSparkleCheck'), t('passwordSparkleMessage'));
      return;
    }

    if (confirmPassword !== password) {
      Alert.alert(t('passwordMatchCheck'), t('passwordMatchMessage'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim())) {
      Alert.alert(t('parentEmailNeeded'), t('parentEmailNeededMessage'));
      return;
    }

    if (!legalAccepted) {
      Alert.alert(t('reviewRequired'), t('reviewRequiredMessage'));
      return;
    }

    registerParent(cleanPassword, parentEmail.trim());
  };

  if (verificationPending) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.centeredContent}>
            <Ionicons name="mail-unread-outline" size={72} color="#6155F6" />
            <Text style={[headingFont, styles.recoveryTitle]}>{t('verifyParentEmail')}</Text>
            <Text style={[bodyFont, styles.recoveryMessage]}>
              {`We sent a verification link to ${verificationEmailMasked}. Open the link, then come back and continue.`}
            </Text>
            <Pressable accessibilityRole="button" onPress={checkParentEmailVerification} style={styles.loginButton}>
              <Text style={[headingFont, styles.loginButtonText]}>{t('emailVerifiedButton')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={resendVerificationEmail} style={styles.secondaryButton}>
              <Text style={[headingFont, styles.secondaryButtonText]}>{t('resendVerificationEmail')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={cancelVerification} style={styles.textButton}>
              <Text style={[bodyFont, styles.textButtonLabel]}>{t('backToSignIn')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (consentPending) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.consentContent} showsVerticalScrollIndicator={false}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#31C778" />
            <Text style={[headingFont, styles.recoveryTitle]}>{t('parentConsent')}</Text>
            <View style={styles.noticeCard}>
              <Text style={[headingFont, styles.noticeTitle]}>{t('consentReviewTitle')}</Text>
              <Text style={[bodyFont, styles.noticeText]}>{t('consentCollectionNotice')}</Text>
              <Text style={[bodyFont, styles.noticeText]}>{t('consentServiceNotice')}</Text>
              <Text style={[bodyFont, styles.noticeText]}>{t('consentRightsNotice')}</Text>
              <Text style={[bodyFont, styles.noticeContact]}>Jamil Obeid · {t('beirutLebanon')} · +961 81 343 191</Text>
            </View>
            <View style={styles.consentForm}>
              <Text style={[headingFont, styles.signupLabel]}>{t('parentLegalName')}</Text>
              <TextInput value={parentLegalName} onChangeText={setParentLegalName} autoCapitalize="words" style={[bodyFont, styles.consentInput]} />
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: leaderboardRequested }} onPress={() => setLeaderboardRequested((value) => !value)} style={styles.consentChoice}>
                <View style={[styles.checkbox, leaderboardRequested && styles.checkboxChecked]}>{leaderboardRequested ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}</View>
                <Text style={[bodyFont, styles.consentChoiceText]}>{t('leaderboardConsent')}</Text>
              </Pressable>
              <Text style={[headingFont, styles.signupLabel]}>{t('typeConsent')}</Text>
              <TextInput value={consentSignature} onChangeText={setConsentSignature} autoCapitalize="characters" style={[bodyFont, styles.consentInput]} />
              <Pressable accessibilityRole="button" onPress={() => submitParentalConsent(parentLegalName, leaderboardRequested, consentSignature)} style={styles.loginButton}>
                <Text style={[headingFont, styles.loginButtonText]}>{t('submitSignedRequest')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (childSetupPending) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.centeredContent}>
            <Ionicons name="happy-outline" size={68} color="#6155F6" />
            <Text style={[headingFont, styles.recoveryTitle]}>{t('createChildProfile')}</Text>
            <Text style={[bodyFont, styles.recoveryMessage]}>{t('createChildProfileMessage')}</Text>
            <View style={styles.recoveryPanel}>
              <Text style={[headingFont, styles.signupLabel]}>{t('username')}:</Text>
              <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} style={[bodyFont, styles.consentInput]} />
              <Text style={[headingFont, styles.recoveryFieldLabel]}>{t('age')}:</Text>
              <View style={styles.agePicker}>
                <Pressable accessibilityRole="button" accessibilityLabel="Decrease age" disabled={age <= 4} onPress={() => setAge((value) => Math.max(4, value - 1))} style={[styles.ageButton, age <= 4 && styles.ageButtonDisabled]}>
                  <Text style={[headingFont, styles.ageButtonText]}>−</Text>
                </Pressable>
                <Text style={[headingFont, styles.ageValue]}>{age}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Increase age" disabled={age >= 12} onPress={() => setAge((value) => Math.min(12, value + 1))} style={[styles.ageButton, age >= 12 && styles.ageButtonDisabled]}>
                  <Text style={[headingFont, styles.ageButtonText]}>+</Text>
                </Pressable>
              </View>
              <Pressable accessibilityRole="button" onPress={() => completeChildSetup(username, age)} style={[styles.loginButton, styles.recoverySubmit]}>
                <Text style={[headingFont, styles.loginButtonText]}>{t('createChildProfile')}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (showForgotPassword) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.centeredContent}>
            <Ionicons name="key-outline" size={66} color="#6155F6" />
            <Text style={[headingFont, styles.recoveryTitle]}>{t('resetPassword')}</Text>
            <Text style={[bodyFont, styles.recoveryMessage]}>{t('resetPasswordMessage')}</Text>
            <View style={styles.recoveryPanel}>
              <Text style={[headingFont, styles.label]}>{t('parentEmail')}:</Text>
              <TextInput value={parentEmail} onChangeText={setParentEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={[bodyFont, styles.underlineInput]} />
              <Pressable
                accessibilityRole="button"
                onPress={() => requestPasswordReset(parentEmail)}
                style={[styles.loginButton, styles.recoverySubmit]}
              >
                <Text style={[headingFont, styles.loginButtonText]}>{t('sendResetLink')}</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setShowForgotPassword(false)} style={styles.textButton}>
              <Text style={[bodyFont, styles.textButtonLabel]}>{t('backToSignIn')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (isSignup) {
    return (
      <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.signupContent} showsVerticalScrollIndicator={false}>
            <View style={styles.signupHeaderRow}>
              <Text style={[headingFont, styles.signupTitle]}>{t('newToUs')}</Text>
            </View>
            <View style={styles.signupMascots}>
              <Image source={signupSparkleToothImage} style={[styles.signupMascot, styles.signupSparkleMascot]} resizeMode="contain" />
              <Image source={signupBrushToothImage} style={[styles.signupMascot, styles.signupBrushMascot]} resizeMode="contain" />
            </View>
            <Text style={[headingFont, styles.signupSubtitle]}>{t('signupSubtitle')}</Text>
            <View style={styles.signupPanel}>
              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>{t('parentEmail')}:</Text>
                <TextInput
                  value={parentEmail}
                  onChangeText={setParentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[bodyFont, styles.signupUnderlineInput]}
                />
              </View>

              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>{t('password')}:</Text>
                <View style={styles.signupPasswordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[bodyFont, styles.signupPasswordInput]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? t('hidePassword') : t('showPassword')}
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    hitSlop={10}
                    style={styles.eyeButton}
                  >
                    <PasswordVisibilityIcon hidden={!passwordVisible} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.signupField}>
                <Text style={[headingFont, styles.signupLabel]}>{t('confirmPassword')}:</Text>
                <View style={styles.signupPasswordRow}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!confirmPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[bodyFont, styles.signupPasswordInput]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={confirmPasswordVisible ? t('hideConfirmPassword') : t('showConfirmPassword')}
                    onPress={() => setConfirmPasswordVisible((visible) => !visible)}
                    hitSlop={10}
                    style={styles.eyeButton}
                  >
                    <PasswordVisibilityIcon hidden={!confirmPasswordVisible} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.legalAgreement}>
                <Text style={[bodyFont, styles.legalIntro]}>{t('beforeCreatingAccount')}</Text>
                <View style={styles.legalLinksRow}>
                  <Pressable accessibilityRole="link" onPress={() => setOpenLegalDocument('privacy')} hitSlop={6}>
                    <Text style={[headingFont, styles.legalLink]}>{t('privacyPolicy')}</Text>
                  </Pressable>
                  <Text style={[bodyFont, styles.legalSeparator]}>{t('and')}</Text>
                  <Pressable accessibilityRole="link" onPress={() => setOpenLegalDocument('terms')} hitSlop={6}>
                    <Text style={[headingFont, styles.legalLink]}>{t('termsOfUse')}</Text>
                  </Pressable>
                </View>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: legalAccepted }} onPress={() => setLegalAccepted((value) => !value)} style={styles.legalAcceptRow}>
                  <View style={[styles.checkbox, legalAccepted && styles.checkboxChecked]}>
                    {legalAccepted ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={[bodyFont, styles.legalAcceptText]}>{t('legalAcceptance')}</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('createAccount')}
                onPress={validateSignup}
                style={({ pressed }) => [styles.signupCreateButton, pressed && styles.loginButtonPressed]}
              >
                <Text style={[headingFont, styles.signupCreateButtonText]}>{t('createParentAccount')}</Text>
              </Pressable>
            </View>
            <LegalDocumentModal documentId={openLegalDocument} onClose={() => setOpenLegalDocument(null)} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#44D0C4', '#DDF6F3', '#FFFFFF']} locations={[0, 0.55, 1]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={[headingFont, styles.title]}>{t('enterProgress')}</Text>
          <View style={styles.mascotRow}>
            <Image source={bubbleToothImage} style={[styles.mascot, styles.bubbleMascot]} resizeMode="contain" />
            <Image source={bowToothImage} style={[styles.mascot, styles.bowMascot]} resizeMode="contain" />
          </View>

          <View style={styles.formPanel}>
            <View style={styles.fieldBlock}>
              <Text style={[headingFont, styles.label]}>{t('parentEmail')}:</Text>
              <TextInput
                value={parentEmail}
                onChangeText={setParentEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder=""
                style={[bodyFont, styles.underlineInput]}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[headingFont, styles.label]}>{t('password')}:</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder=""
                  style={[bodyFont, styles.passwordInput]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={passwordVisible ? t('hidePassword') : t('showPassword')}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <PasswordVisibilityIcon hidden={!passwordVisible} />
                </Pressable>
              </View>
            </View>

            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: rememberMe }} onPress={() => setRememberMe((value) => !value)} style={styles.rememberRow}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={[bodyFont, styles.rememberText]}>{t('rememberMe')}</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => setShowForgotPassword(true)} style={styles.forgotButton}>
              <Text style={[bodyFont, styles.forgotButtonText]}>{t('forgotPassword')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('login')}
              onPress={() => signInChild(parentEmail, password, rememberMe)}
              style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
            >
              <Text style={[headingFont, styles.loginButtonText]}>{t('login')}</Text>
            </Pressable>
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
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 37
  },
  title: {
    color: '#41438F',
    fontSize: 27,
    lineHeight: 35,
    marginBottom: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  mascotRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 58,
    height: 72,
    justifyContent: 'center',
    marginBottom: 0
  },
  mascot: {
    height: 78,
    width: 78
  },
  bubbleMascot: {
    transform: [{ rotate: '-8deg' }]
  },
  bowMascot: {
    marginTop: 2,
    transform: [{ rotate: '7deg' }]
  },
  formPanel: {
    alignSelf: 'stretch',
    backgroundColor: '#F7FBFF',
    borderRadius: 28,
    borderWidth: 0,
    marginTop: 18,
    paddingBottom: 34,
    paddingHorizontal: 32,
    paddingTop: 34,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    width: '100%'
  },
  fieldBlock: {
    marginBottom: 36
  },
  label: {
    color: '#080808',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 13
  },
  underlineInput: {
    borderBottomColor: '#333333',
    borderBottomWidth: 1.5,
    color: '#111111',
    fontSize: 16,
    height: 30,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  passwordRow: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.5,
    flexDirection: 'row',
    height: 40
  },
  passwordInput: {
    color: '#111111',
    flex: 1,
    fontSize: 16,
    height: 38,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  eyeButton: {
    alignItems: 'center',
    backgroundColor: '#ECEAFF',
    borderColor: '#C9C4FF',
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    marginLeft: 6,
    width: 34
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#41438F',
    borderRadius: 4,
    borderWidth: 1.5,
    height: 19,
    justifyContent: 'center',
    width: 19
  },
  checkboxChecked: {
    backgroundColor: '#6155F6'
  },
  rememberRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 9,
    marginTop: -18,
    paddingVertical: 8
  },
  rememberText: {
    color: '#41438F',
    fontSize: 14,
    fontWeight: '800'
  },
  loginButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 22,
    height: 45,
    justifyContent: 'center',
    shadowColor: '#1C2754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    width: 260,
    elevation: 3
  },
  loginButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }]
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 5,
    padding: 6
  },
  forgotButtonText: {
    color: '#41438F',
    fontSize: 14,
    fontWeight: '900',
    textDecorationLine: 'underline'
  },
  signupContent: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 34,
    paddingHorizontal: 35,
    paddingTop: 22
  },
  signupHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    width: '100%'
  },
  signupTitle: {
    color: '#41438F',
    flex: 1,
    fontSize: 52,
    lineHeight: 60,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  },
  signupMascots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 12
  },
  signupMascot: {
    height: 60,
    width: 60
  },
  signupSparkleMascot: {
    transform: [{ rotate: '-12deg' }]
  },
  signupBrushMascot: {
    transform: [{ rotate: '10deg' }]
  },
  signupSubtitle: {
    color: '#17324D',
    fontSize: 25,
    lineHeight: 32,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(18, 26, 80, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },
  signupPanel: {
    backgroundColor: '#F7FFFC',
    borderWidth: 0,
    borderRadius: 28,
    shadowColor: '#17324D',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
    minHeight: 530,
    paddingHorizontal: 70,
    paddingTop: 29,
    width: '100%', 
    gap: 10
  },
  signupField: {
    marginBottom: 19
  },
  signupLabel: {
    color: '#080808',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 9
  },
  signupUnderlineInput: {
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    color: '#111111',
    fontSize: 16,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  signupPasswordRow: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    flexDirection: 'row',
    height: 38
  },
  signupPasswordInput: {
    color: '#111111',
    flex: 1,
    fontSize: 16,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 2
  },
  agePicker: {
    alignItems: 'center',
    borderBottomColor: '#333333',
    borderBottomWidth: 1.4,
    flexDirection: 'row',
    height: 34,
    justifyContent: 'space-between'
  },
  ageButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(97, 85, 246, 0.12)',
    borderColor: '#6155F6',
    borderRadius: 13,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 34
  },
  ageButtonDisabled: { opacity: 0.4 },
  ageButtonText: { color: '#302B82', fontSize: 22, lineHeight: 24, textAlign: 'center' },
  ageValue: {
    color: '#111111',
    fontSize: 20,
    lineHeight: 26
  },
  signupCreateButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#6155F6',
    borderRadius: 21,
    height: 40,
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#1C2754',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    width: 260,
    elevation: 3,
    marginBottom: 20
  },
  signupCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21
  },
  centeredContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 34
  },
  recoveryTitle: {
    color: '#41438F',
    fontSize: 29,
    lineHeight: 36,
    marginTop: 16,
    textAlign: 'center'
  },
  recoveryMessage: {
    color: '#17324D',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
    marginTop: 12,
    maxWidth: 340,
    textAlign: 'center'
  },
  recoveryPanel: {
    alignSelf: 'stretch',
    backgroundColor: '#F7FBFF',
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 28,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10
  },
  recoveryFieldLabel: {
    color: '#080808',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 13,
    marginTop: 25
  },
  recoverySubmit: {
    marginTop: 30
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#E6FFF8',
    borderColor: '#2EC4B6',
    borderRadius: 22,
    borderWidth: 1.5,
    height: 45,
    justifyContent: 'center',
    marginTop: 14,
    width: 260
  },
  secondaryButtonText: {
    color: '#168954',
    fontSize: 14
  },
  textButton: {
    marginTop: 13,
    padding: 8
  },
  textButtonLabel: {
    color: '#41438F',
    fontSize: 14,
    fontWeight: '900'
  },
  consentContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  noticeCard: {
    backgroundColor: '#F7FFFC',
    borderRadius: 24,
    marginTop: 18,
    padding: 20,
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  noticeTitle: { color: '#41438F', fontSize: 19, lineHeight: 25, marginBottom: 10 },
  noticeText: { color: '#17324D', fontSize: 14, lineHeight: 20, marginBottom: 9 },
  noticeContact: { color: '#087C72', fontSize: 13, lineHeight: 19, fontWeight: '800' },
  consentForm: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 16,
    padding: 20
  },
  consentInput: {
    borderBottomColor: '#41438F',
    borderBottomWidth: 1.4,
    color: '#111111',
    fontSize: 16,
    height: 38,
    marginBottom: 20
  },
  consentChoice: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, marginBottom: 20 },
  consentChoiceText: { color: '#17324D', flex: 1, fontSize: 13, lineHeight: 19 },
  legalAgreement: { backgroundColor: '#F0FAF8', borderColor: '#CDE9E3', borderRadius: 16, borderWidth: 1, gap: 9, marginBottom: 22, padding: 13 },
  legalIntro: { color: '#455A68', fontSize: 12, lineHeight: 17 },
  legalLinksRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  legalLink: { color: '#41438F', fontSize: 13, lineHeight: 19, textDecorationLine: 'underline' },
  legalSeparator: { color: '#526A68', fontSize: 12, lineHeight: 18 },
  legalAcceptRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  legalAcceptText: { color: '#17324D', flex: 1, fontSize: 12, lineHeight: 18 }
});
