import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Edit02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { getUserData, deleteAccount, updateUserProfile } from '../../api';
import { validator } from '../auth/UserValidator';

const EditIconComponent = Edit02Icon || PencilEdit02Icon;

interface ProfileScreenProps {
  userId: string;
  onLogout: () => void;
}

export default function ProfileScreen({ userId, onLogout }: ProfileScreenProps) {
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
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserData(userId);
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
  }, [userId]);

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
      await updateUserProfile(userId, {
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
      await deleteAccount(userId);
      onLogout();
    } catch {
      alert('Konto konnte nicht gelöscht werden.');
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.box}>
        <Text style={styles.label}>Vorname</Text>
        <View style={styles.row}>
          <TextInput
            ref={firstNameRef}
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TouchableOpacity onPress={() => firstNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color="#2563EB" />
            ) : (
              <Text style={styles.editFallback}>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Nachname</Text>
        <View style={styles.row}>
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
          <TouchableOpacity onPress={() => lastNameRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color="#2563EB" />
            ) : (
              <Text style={styles.editFallback}>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>E-Mail</Text>
        <View style={styles.row}>
          <TextInput
            ref={emailRef}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => emailRef.current?.focus()}>
            {EditIconComponent ? (
              <HugeiconsIcon icon={EditIconComponent} size={20} color="#2563EB" />
            ) : (
              <Text style={styles.editFallback}>✏️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Nutzer-ID</Text>
        <Text style={styles.text}>{publicId || '–'}</Text>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {hasChanges && (
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Änderungen speichern</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Abmelden</Text>
      </TouchableOpacity>

      <View style={styles.deleteArea}>
        {!showConfirm ? (
          <TouchableOpacity onPress={() => setShowConfirm(true)}>
            <Text style={styles.deleteText}>Konto löschen</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Konto wirklich löschen?</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmAndDelete}>
                <Text style={styles.confirmBtnText}>Ja, löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#6B7280', marginLeft: 10 }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.confirmBtnText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#0F172A' },
  box: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 16, color: '#0F172A', paddingVertical: 4 },
  text: { fontSize: 16, color: '#0F172A' },
  editFallback: { fontSize: 18, paddingHorizontal: 4 },
  errorText: { color: '#DC2626', textAlign: 'center', marginBottom: 10, fontWeight: '500' },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButton: { backgroundColor: '#2563EB' },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { backgroundColor: '#FEE2E2' },
  logoutButtonText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
  deleteArea: { marginTop: 24, alignItems: 'center' },
  deleteText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' },
  confirmBox: { padding: 14, borderWidth: 1, borderColor: '#DC2626', borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center', width: '100%' },
  confirmText: { color: '#DC2626', fontWeight: 'bold', marginBottom: 10 },
  confirmBtn: { backgroundColor: '#DC2626', padding: 8, borderRadius: 6 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});