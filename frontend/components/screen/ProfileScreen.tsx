import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Edit02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { getUserData, deleteAccount, updateUserProfile } from '../../api';
import { validator } from '../auth/UserValidator';

const LOCAL_COLORS = {
  primary: '#2563EB',
  danger: '#DC2626',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  successText: '#166534',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#991B1B',
};

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  const handleFieldChange = (setter: (val: string) => void, val: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setter(val);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

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

      setSuccessMessage('Profil erfolgreich aktualisiert.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmAndDelete = async () => {
    setErrorMessage(null);
    try {
      await deleteAccount();
      onLogout();
    } catch {
      setErrorMessage('Konto konnte nicht gelöscht werden. Bitte erneut versuchen.');
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LOCAL_COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Verwalte deine Kontodaten</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Vorname</Text>
        <View style={styles.row}>
          <TextInput
            ref={firstNameRef}
            style={styles.fieldInput}
            value={firstName}
            onChangeText={(val) => handleFieldChange(setFirstName, val)}
          />
          <TouchableOpacity onPress={() => firstNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={LOCAL_COLORS.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Nachname</Text>
        <View style={styles.row}>
          <TextInput
            ref={lastNameRef}
            style={styles.fieldInput}
            value={lastName}
            onChangeText={(val) => handleFieldChange(setLastName, val)}
          />
          <TouchableOpacity onPress={() => lastNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={LOCAL_COLORS.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>E-Mail</Text>
        <View style={styles.row}>
          <TextInput
            ref={emailRef}
            style={styles.fieldInput}
            value={email}
            onChangeText={(val) => handleFieldChange(setEmail, val)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => emailRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color={LOCAL_COLORS.primary} />
            ) : (
              <Text>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Nutzer-ID</Text>
        <Text style={styles.publicIdText}>{publicId || '–'}</Text>
      </View>

      {successMessage && (
        <View style={styles.bannerSuccess}>
          <Text style={styles.bannerSuccessText}>✓ {successMessage}</Text>
        </View>
      )}

      {errorMessage && (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>✕ {errorMessage}</Text>
        </View>
      )}

      {hasChanges && (
        <TouchableOpacity
          style={[styles.button, styles.saveBtn]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Änderungen speichern</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, styles.logoutBtn]}
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>Abmelden</Text>
      </TouchableOpacity>

      <View style={styles.deleteSection}>
        {!showConfirm ? (
          <TouchableOpacity
            style={styles.deleteTrigger}
            onPress={() => setShowConfirm(true)}
          >
            <Text style={styles.deleteTriggerText}>Konto löschen</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, styles.confirmCard]}>
            <Text style={styles.confirmText}>
              Möchtest du dein Konto und alle Daten unwiderruflich löschen?
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, styles.confirmDeleteBtn]}
                onPress={confirmAndDelete}
              >
                <Text style={styles.confirmBtnText}>Ja, löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelBtn]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelBtnText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    marginBottom: 16,
  },
  card: {
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  fieldLabel: {
    fontSize: 13,
    color: LOCAL_COLORS.textMuted,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldInput: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.bg,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: LOCAL_COLORS.text,
    marginBottom: 0,
    marginRight: 8,
  },
  publicIdText: {
    fontSize: 16,
    color: LOCAL_COLORS.text,
    fontWeight: '500',
  },
  bannerSuccess: {
    backgroundColor: LOCAL_COLORS.successBg,
    borderColor: LOCAL_COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  bannerSuccessText: {
    color: LOCAL_COLORS.successText,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerError: {
    backgroundColor: LOCAL_COLORS.errorBg,
    borderColor: LOCAL_COLORS.errorBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  bannerErrorText: {
    color: LOCAL_COLORS.errorText,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: LOCAL_COLORS.primary,
    marginTop: 8,
  },
  logoutBtn: {
    backgroundColor: LOCAL_COLORS.danger,
    marginTop: 16,
  },
  deleteSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  deleteTrigger: {
    alignItems: 'center',
    padding: 10,
  },
  deleteTriggerText: {
    color: LOCAL_COLORS.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  confirmCard: {
    marginTop: 8,
  },
  confirmText: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.textMuted,
    marginRight: 8,
    paddingVertical: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.surface,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: LOCAL_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});