import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useUser } from '../UserContext';
import { globalStyles, colors } from '../../theme';

export default function QrScreen() {
  const { user, isInitialLoading } = useUser();

  if (isInitialLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const publicId = user?.publicId;

  if (!publicId) {
    return (
      <View style={globalStyles.center}>
        <Text style={[globalStyles.subtitle, { color: colors.danger, textAlign: 'center' }]}>
          Code nicht verfügbar.
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Mein QR-Code</Text>
      <Text style={globalStyles.subtitle}>
        Halte den Code an den Scanner der Station, um dich anzumelden.
      </Text>

      <View style={[globalStyles.card, { alignItems: 'center', paddingVertical: 24, marginVertical: 12 }]}>
        <QRCode
          value={publicId}
          size={220}
          color={colors.text}
          backgroundColor={colors.surface}
        />
        <Text style={[globalStyles.subtitle, { marginTop: 16, marginBottom: 0, fontWeight: '600', color: colors.text, letterSpacing: 1 }]}>
          {publicId}
        </Text>
      </View>

      <Text style={[globalStyles.subtitle, { textAlign: 'center', marginTop: 8 }]}>
        Tipp: Bildschirmhelligkeit erhöhen, falls der Scanner Schwierigkeiten hat.
      </Text>
    </View>
  );
}