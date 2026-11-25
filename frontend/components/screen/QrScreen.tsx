import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useUser } from '../UserContext';

const LOCAL_COLORS = {
  primary: '#2563EB',
  danger: '#DC2626',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
};

export default function QrScreen() {
  const { user, isInitialLoading } = useUser();

  if (isInitialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LOCAL_COLORS.primary} />
      </View>
    );
  }

  const publicId = user?.publicId;

  if (!publicId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Code nicht verfügbar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mein QR-Code</Text>
      <Text style={styles.subtitle}>
        Halte den Code an den Scanner der Station, um dich anzumelden.
      </Text>

      <View style={styles.qrCard}>
        <QRCode
          value={publicId}
          size={220}
          color={LOCAL_COLORS.text}
          backgroundColor={LOCAL_COLORS.surface}
        />
        <Text style={styles.publicIdLabel}>{publicId}</Text>
      </View>

      <Text style={styles.hintText}>
        Tipp: Bildschirmhelligkeit erhöhen, falls der Scanner Schwierigkeiten hat.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LOCAL_COLORS.bg,
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
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: LOCAL_COLORS.danger,
    textAlign: 'center',
  },
  qrCard: {
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  publicIdLabel: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 0,
    fontWeight: '600',
    color: LOCAL_COLORS.text,
    letterSpacing: 1,
  },
  hintText: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});