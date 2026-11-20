import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { registerUser } from '../../api';
import { validator } from '../auth/UserValidator';

interface RegisterScreenProps {
  onBack: () => void;
  onRegisterSuccess: (token: string, userId: string) => void;
  onNavigateLogin: () => void;
}

export default function RegisterScreen({ onBack, onRegisterSuccess, onNavigateLogin }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    const error =
      validator.validateName(firstName, 'Vorname') ||
      validator.validateName(lastName, 'Nachname') ||
      validator.validateEmail(email) ||
      validator.validatePassword(password) ||
      (!isAgeConfirmed ? 'Bitte bestätige, dass du mindestens 16 Jahre alt bist.' : null);

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
      <View style={styles.backButton}>
        <Button title="Zurück" onPress={onBack} />
      </View>

      <Text style={styles.title}>Konto erstellen</Text>

      <TextInput
        style={styles.input}
        placeholder="Vorname"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nachname"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Passwort-Feld mit Umschalter */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
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
              color="#64748B"
            />
          ) : (
            <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Altersbestätigung (ab 16 Jahren) */}
      <TouchableOpacity
        style={styles.checkboxRow}
        activeOpacity={0.7}
        onPress={() => {
          setIsAgeConfirmed((prev) => !prev);
          if (errorMessage) setErrorMessage(null);
        }}
      >
        <View style={[styles.checkboxBox, isAgeConfirmed && styles.checkboxBoxChecked]}>
          {isAgeConfirmed && <Text style={styles.checkboxCheckmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          Ich bestätige, dass ich mindestens 16 Jahre alt bin.
        </Text>
      </TouchableOpacity>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <Button title="Registrieren" onPress={handleRegister} />
        )}
      </View>

      <Button title="Schon registriert? Anmelden" onPress={onNavigateLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  buttonContainer: { marginBottom: 20 },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center', fontWeight: '500' },
});