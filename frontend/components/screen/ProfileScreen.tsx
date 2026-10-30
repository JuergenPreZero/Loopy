import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Edit02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { getUserData, deleteAccount, updateUserProfile } from '../../api';
import { validator } from '../auth/UserValidator';
import { globalStyles, colors } from '../../theme';

const EditIconComponent = Edit02Icon || PencilEdit02Icon;

interface ProfileScreenProps {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [publicId, setPublicId] = useState('');

  const [originalUser, setOriginalUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getUserData();
        if (isMounted && data) {
          const loadedFirst = data.firstName || '';
          const loadedLast = data.lastName || '';
          const loadedEmail = data.email || '';

          setFirstName(loadedFirst);
          setLastName(loadedLast);
          setEmail(loadedEmail);
          setPublicId(data.publicId || '');

          setOriginalUser({
            firstName: loadedFirst,
            lastName: loadedLast,
            email: loadedEmail,
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden des Profils:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasChanges = Boolean(
    originalUser &&
      (firstName !== originalUser.firstName ||
        lastName !== originalUser.lastName ||
        email !== originalUser.email)
  );

  const handleSave = async () => {
    setErrorMessage(null);

    const error =
      validator.validateName(firstName, 'Vorname') ||
      validator.validateName(lastName, 'Nachname') ||
      validator.validateEmail(email);

    if (error) {
      setErrorMessage(error);
      return;
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    setIsSaving(true);
    try {
      await updateUserProfile({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: normalizedEmail,
      });

      setFirstName(trimmedFirst);
      setLastName(trimmedLast);
      setEmail(normalizedEmail);

      setOriginalUser({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: normalizedEmail,
      });

      alert('Profil erfolgreich gespeichert!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAndDelete = async () => {
    try {
      await deleteAccount();
      onLogout();
    } catch {
      alert('Konto konnte nicht gelöscht werden.');
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContent}>
      <Text style={globalStyles.title}>Profil</Text>
      <Text style={globalStyles.subtitle}>Verwalte deine Kontodaten</Text>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 6 }]}>Vorname</Text>
        <View style={globalStyles.row}>
          <TextInput
            ref={firstNameRef}
            style={[globalStyles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TouchableOpacity onPress={() => firstNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={colors.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 6 }]}>Nachname</Text>
        <View style={globalStyles.row}>
          <TextInput
            ref={lastNameRef}
            style={[globalStyles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
            value={lastName}
            onChangeText={setLastName}
          />
          <TouchableOpacity onPress={() => lastNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={colors.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 6 }]}>E-Mail</Text>
        <View style={globalStyles.row}>
          <TextInput
            ref={emailRef}
            style={[globalStyles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => emailRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={colors.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 6 }]}>Nutzer-ID</Text>
        <Text style={{ fontSize: 16, color: colors.text, fontWeight: '500' }}>
          {publicId || '–'}
        </Text>
      </View>

      {errorMessage && (
        <Text style={{ color: colors.danger, textAlign: 'center', marginVertical: 8 }}>
          {errorMessage}
        </Text>
      )}

      {hasChanges && (
        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 8 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={globalStyles.buttonText}>Änderungen speichern</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[globalStyles.buttonDanger, { marginTop: 16 }]}
        onPress={onLogout}
      >
        <Text style={globalStyles.buttonText}>Abmelden</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, marginBottom: 32 }}>
        {!showConfirm ? (
          <TouchableOpacity
            style={{ alignItems: 'center', padding: 10 }}
            onPress={() => setShowConfirm(true)}
          >
            <Text style={{ color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' }}>
              Konto löschen
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[globalStyles.card, { borderColor: colors.border, marginTop: 8 }]}>
            <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 12 }]}>
              Möchtest du dein Konto und alle Daten unwiderruflich löschen?
            </Text>
            <View style={globalStyles.row}>
              <TouchableOpacity
                style={[
                  globalStyles.buttonSecondary,
                  { flex: 1, marginRight: 8, paddingVertical: 10 },
                ]}
                onPress={confirmAndDelete}
              >
                <Text style={[globalStyles.buttonText, { fontSize: 14 }]}>Ja, löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 10 },
                ]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={[globalStyles.buttonText, { color: colors.text, fontSize: 14 }]}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}