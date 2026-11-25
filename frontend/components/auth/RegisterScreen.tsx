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
import { registerUser } from '../../api';
import { validator } from '../auth/UserValidator';
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

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterSuccess: (token: string, userId: string) => void;
  onNavigateLogin: () => void;
}

export default function RegisterScreen({
  onBack,
  onRegisterSuccess,
  onNavigateLogin,
}: RegisterScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    const error =
      validator.validateName(firstName, 'Vorname') ||
      validator.validateName(lastName, 'Nachname') ||
      validator.validateEmail(email) ||
      validator.validatePassword(password) ||
      (!isAgeConfirmed
        ? 'Bitte bestätige, dass du mindestens 16 Jahre alt bist.'
        : null);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsLoading(true);
    try {
      const authData = await registerUser(
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        password
      );
      onRegisterSuccess(authData.token, authData.user.id);
    } catch (err) {
      setErrorMessage('Registrierung fehlgeschlagen. E-Mail existiert bereits.');
      console.error(err);
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
            <View style={styles.accentOrbPurpleLeft} />
            <View style={styles.accentOrbGreenMidLeft} />
            <View style={styles.accentOrbGreenRightBottom} />
          </View>

          {/* Header */}
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
                <Text style={styles.speechText}>Los geht’s!</Text>
              </View>
            </View>

            <Text style={styles.title}>Konto erstellen</Text>
          </View>

          {/* Formular-Karte */}
          <View style={styles.formCard}>
            {/* Vorname & Nachname mit harter Prozentbreite */}
            <View style={styles.nameRow}>
              <View
                style={[
                  styles.halfInputBox,
                  focusedField === 'firstName' && styles.boxFocused,
                ]}
              >
                <TextInput
                  style={styles.innerTextInput}
                  placeholder="Vorname"
                  placeholderTextColor="#7A6E87"
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View
                style={[
                  styles.halfInputBox,
                  focusedField === 'lastName' && styles.boxFocused,
                ]}
              >
                <TextInput
                  style={styles.innerTextInput}
                  placeholder="Nachname"
                  placeholderTextColor="#7A6E87"
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* E-Mail */}
            <View
              style={[
                styles.fullInputBox,
                focusedField === 'email' && styles.boxFocused,
              ]}
            >
              <TextInput
                style={styles.innerTextInput}
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
            </View>

            {/* Passwort */}
            <View
              style={[
                styles.fullInputBox,
                focusedField === 'password' && styles.boxFocused,
              ]}
            >
              <TextInput
                style={styles.innerTextInput}
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

            {/* Altersbestätigung */}
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.78}
              onPress={() => {
                setIsAgeConfirmed((prev) => !prev);
                if (errorMessage) setErrorMessage(null);
              }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  isAgeConfirmed && styles.checkboxBoxChecked,
                ]}
              >
                {isAgeConfirmed && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Ich bestätige, dass ich mindestens 16 Jahre alt bin.
              </Text>
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
                  onPress={handleRegister}
                  activeOpacity={0.86}
                >
                  <Text style={styles.primaryButtonText}>Registrieren</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onNavigateLogin}
                activeOpacity={0.86}
              >
                <Text style={styles.secondaryButtonText}>
                  Schon registriert? Anmelden
                </Text>
              </TouchableOpacity>
              <ErrorPopupModal
                visible={Boolean(errorMessage)}
                message={errorMessage}
                title="Registrierung nicht möglich"
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
  accentOrbPurpleLeft: {
    position: 'absolute',
    top: 72,
    left: -85,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(175, 225, 150, 0.08)',
  },
  accentOrbGreenMidLeft: {
    position: 'absolute',
    top: 460, // Fester Abstand von oben (im grünen Bereich) statt 'bottom: 135'
    left: -55,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },
  accentOrbGreenRightBottom: {
    position: 'absolute',
    top: 580, // Fester Abstand von oben statt 'bottom: -65'
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
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
    overflow: 'hidden',
    zIndex: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  halfInputBox: {
    width: '48.2%',
    maxWidth: '48.2%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: DESIGN_COLORS.inputBorder,
    borderRadius: 15,
    overflow: 'hidden',
  },
  fullInputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: DESIGN_COLORS.inputBorder,
    borderRadius: 15,
    marginBottom: 14,
    overflow: 'hidden',
  },
  boxFocused: {
    borderColor: DESIGN_COLORS.darkPurple,
    backgroundColor: DESIGN_COLORS.white,
  },
  innerTextInput: {
    flexGrow: 1,
    flexShrink: 1,
    width: 0,
    minWidth: 0,
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