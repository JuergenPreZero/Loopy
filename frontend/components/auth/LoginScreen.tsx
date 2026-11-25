import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { loginUser } from '../../api';
import ErrorPopupModal from '../auth/ErrorPopupModal';

const DESIGN_COLORS = {
  vibrantGreen: '#AFE196',
  darkPurple: '#563D6D',
  darkPurpleDeep: '#3F2B52',
  vibrantRed: '#E84249',
  white: '#FFFFFF',
  inputBg: '#F7F9F5',
  inputBorder: 'rgba(86, 61, 109, 0.22)',
  mutedText: '#5F546B',
  errorBg: 'rgba(232, 66, 73, 0.10)',
};

const FONTS = {
  regular: 'outfit-regular',
  medium: 'outfit-medium',
  semibold: 'outfit-semibold',
  bold: 'outfit-bold',
  black: 'outfit-black',
};

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (token: string, rememberMe: boolean) => void;
  onNavigateRegister: () => void;
}

export default function LoginScreen({
  onBack,
  onLoginSuccess,
  onNavigateRegister,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email && password) {
      setErrorMessage('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
    if (email && !password) {
      setErrorMessage('Bitte gib dein Passwort ein.');
      return;
    }
    if (!email || !password) {
      setErrorMessage('Bitte fülle alle Felder aus.');
      return;
    }

    setIsLoading(true);
    try {
      const authData = await loginUser(email.trim(), password);
      onLoginSuccess(authData.token, rememberMe);
    } catch (error) {
      setErrorMessage(
        'Login fehlgeschlagen. Überprüfe deine E-Mail oder das Passwort.'
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Fester Hintergrund-Layer: Bewegt sich mit dem Inhalt und schneidet unten sauber ab */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={styles.purpleBackdrop} />
            <View style={styles.accentOrbPurpleRight} />
            <View style={styles.accentOrbGreenMidRight} />
            <View style={styles.accentOrbGreenLeftBottom} />
          </View>

          {/* Header mit fest verankertem Logo & unabhängiger Sprechblase */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backPill}
              onPress={onBack}
              activeOpacity={0.85}
            >
              <Text style={styles.backPillText}>← Zurück</Text>
            </TouchableOpacity>

            <Image
              source={require('../../assets/Loopy_Logo_Green_3C_Happy.png')}
              style={styles.fixedLogo}
              resizeMode="contain"
            />

            <View style={styles.fixedBubbleWrapper}>
              <View style={styles.speechPointerUp} />
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>Willkommen zurück!</Text>
              </View>
            </View>

            <Text style={styles.title}>Anmelden</Text>
          </View>

          {/* Formular-Karte */}
          <View style={styles.formCard}>
            <TextInput
              style={[
                styles.input,
                styles.fieldSpacing,
                focusedField === 'email' && styles.inputFocused,
              ]}
              placeholder="E-Mail"
              placeholderTextColor="#7A6E87"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />

            <View
              style={[
                styles.passwordContainer,
                styles.fieldSpacing,
                focusedField === 'password' && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Passwort"
                placeholderTextColor="#7A6E87"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {ViewIcon && ViewOffSlashIcon ? (
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                    size={20}
                    color={DESIGN_COLORS.darkPurple}
                  />
                ) : (
                  <Text style={{ fontSize: 16 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.78}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  rememberMe && styles.checkboxBoxChecked,
                ]}
              >
                {rememberMe && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Angemeldet bleiben</Text>
            </TouchableOpacity>


            <View style={styles.buttonContainer}>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={DESIGN_COLORS.darkPurple}
                  style={styles.loader}
                />
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleLogin}
                  activeOpacity={0.86}
                >
                  <Text style={styles.primaryButtonText}>Anmelden</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onNavigateRegister}
                activeOpacity={0.86}
              >
                <Text style={styles.secondaryButtonText}>
                  Noch kein Konto? Konto erstellen
                </Text>
              </TouchableOpacity>

              <ErrorPopupModal
                visible={Boolean(errorMessage)}
                message={errorMessage}
                title="Anmeldung fehlgeschlagen"
                onClose={() => setErrorMessage(null)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.vibrantGreen,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  purpleBackdrop: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    height: 274,
    backgroundColor: DESIGN_COLORS.darkPurple,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  accentOrbPurpleRight: {
    position: 'absolute',
    top: 58,
    right: -75,
    width: 195,
    height: 195,
    borderRadius: 97.5,
    backgroundColor: 'rgba(175, 225, 150, 0.08)',
  },
  accentOrbGreenMidRight: {
    position: 'absolute',
    top: 440,
    right: -55,
    width: 135,
    height: 135,
    borderRadius: 67.5,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },
  accentOrbGreenLeftBottom: {
    position: 'absolute',
    top: 575, // Fester Abstand von oben statt 'bottom: -75'
    left: -70,
    width: 245,
    height: 245,
    borderRadius: 122.5,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  headerSection: {
    position: 'relative',
    minHeight: 168,
    paddingTop: 32,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(175, 225, 150, 0.28)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  backPillText: {
    fontFamily: FONTS.semibold,
    fontSize: 13.5,
    color: DESIGN_COLORS.white,
  },
  fixedLogo: {
    position: 'absolute',
    top: 28,
    right: 20,
    width: 108,
    height: 50,
  },
  fixedBubbleWrapper: {
    position: 'absolute',
    top: 78,
    right: 36,
    alignItems: 'flex-end',
  },
  speechPointerUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: DESIGN_COLORS.vibrantRed,
    marginRight: 16,
    marginBottom: -1,
  },
  speechBubble: {
    backgroundColor: DESIGN_COLORS.vibrantRed,
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 15,
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  speechText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 16,
    color: DESIGN_COLORS.white,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 30,
    lineHeight: 35,
    color: DESIGN_COLORS.white,
    letterSpacing: -0.4,
    marginTop: 46,
  },
  formCard: {
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: DESIGN_COLORS.white,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(86, 61, 109, 0.14)',
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    zIndex: 2,
  },
  fieldSpacing: {
    marginBottom: 14,
  },
  input: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: DESIGN_COLORS.darkPurpleDeep,
    backgroundColor: DESIGN_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: DESIGN_COLORS.inputBorder,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputFocused: {
    borderColor: DESIGN_COLORS.darkPurple,
    backgroundColor: DESIGN_COLORS.white,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: DESIGN_COLORS.inputBorder,
    borderRadius: 15,
  },
  passwordInput: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: DESIGN_COLORS.darkPurpleDeep,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  eyeButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: DESIGN_COLORS.inputBorder,
    backgroundColor: DESIGN_COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  checkboxBoxChecked: {
    backgroundColor: DESIGN_COLORS.vibrantRed,
    borderColor: DESIGN_COLORS.vibrantRed,
  },
  checkboxCheckmark: {
    fontFamily: FONTS.bold,
    color: DESIGN_COLORS.white,
    fontSize: 14,
    lineHeight: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    lineHeight: 18,
    color: DESIGN_COLORS.mutedText,
  },
  errorText: {
    fontFamily: FONTS.semibold,
    color: DESIGN_COLORS.vibrantRed,
    fontSize: 13.5,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
    marginTop: 2,
  },
  loader: {
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: DESIGN_COLORS.darkPurple,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DESIGN_COLORS.darkPurpleDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    color: DESIGN_COLORS.white,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: DESIGN_COLORS.white,
    borderColor: 'rgba(86, 61, 109, 0.25)',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.semibold,
    color: DESIGN_COLORS.darkPurple,
    fontSize: 15,
  },
});