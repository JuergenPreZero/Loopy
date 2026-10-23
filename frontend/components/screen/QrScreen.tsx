import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getUserData } from '../../api';
import { globalStyles, colors } from '../../theme';

interface QrScreenProps {
  userId: string;
}

export default function QrScreen({ userId }: QrScreenProps) {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        const data = await getUserData(userId);
        if (isMounted) {
          if (data?.publicId) {
            setPublicId(data.publicId);
          } else {
            setError('Keine gültige Public-ID gefunden.');
          }
        }
      } catch (err) {
        if (isMounted) setError('Fehler beim Laden des QR-Codes.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !publicId) {
    return (
      <View style={globalStyles.center}>
        <Text style={[globalStyles.subtitle, { color: colors.danger, textAlign: 'center' }]}>
          {error || 'Code nicht verfügbar.'}
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