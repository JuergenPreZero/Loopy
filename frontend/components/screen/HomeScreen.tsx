import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { QrCodeIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { useUser } from '../UserContext';
import { globalStyles, colors } from '../../theme';

interface HomeScreenProps {
  userId?: string;
  setActivePage?: (page: number) => void;
}

export default function HomeScreen({ setActivePage }: HomeScreenProps) {
  const { user, totalQuantity, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (isInitialLoading && !user) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const firstName = user?.firstName || 'du';
  const estimatedCoins = totalQuantity * 35;
  const co2Saved = (totalQuantity * 0.42).toFixed(1);

  return (
    <ScrollView
      contentContainerStyle={globalStyles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={{ marginBottom: 16 }}>
        <Text style={globalStyles.title}>Hey {firstName}, </Text>
        <Text style={globalStyles.subtitle}>
          Schön, dass du wieder da bist!
        </Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 4 }]}>Bisher recycelt</Text>
        <Text style={globalStyles.bigNumber}>{totalQuantity}</Text>
        <Text style={[globalStyles.subtitle, { marginBottom: 0, marginTop: 8 }]}>
          Artikel wieder zurück in den Kreislauf gebracht
        </Text>
      </View>

      <View style={[globalStyles.row, { marginBottom: 16 }]}>
        <View style={[globalStyles.card, { flex: 1, marginRight: 6, marginBottom: 0 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 4, fontSize: 13 }]}>Coins verdient</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>
            {estimatedCoins}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>ReCoins gesammelt</Text>
        </View>

        <View style={[globalStyles.card, { flex: 1, marginLeft: 6, marginBottom: 0 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 4, fontSize: 13 }]}>CO₂ gespart</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#16A34A' }}>
            {co2Saved} kg
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Emissionen verhindert</Text>
        </View>
      </View>

      <View style={globalStyles.row}>
        {/* Navigiert zu Seite 4 (Prämien-Shop) */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              flex: 1,
              marginRight: 6,
              flexDirection: 'row',
              justifyContent: 'center',
            },
          ]}
          onPress={() => setActivePage?.(4)}
          activeOpacity={0.8}
        >
          {ShoppingBag01Icon ? (
            <HugeiconsIcon icon={ShoppingBag01Icon} size={18} color="#FFFFFF" />
          ) : null}
          <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Prämien</Text>
        </TouchableOpacity>

        {/* Navigiert zu Seite 3 (QR-Code) */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              flex: 1,
              marginLeft: 6,
              flexDirection: 'row',
              justifyContent: 'center',
            },
          ]}
          onPress={() => setActivePage?.(3)}
          activeOpacity={0.8}
        >
          {QrCodeIcon ? (
            <HugeiconsIcon icon={QrCodeIcon} size={18} color="#FFFFFF" />
          ) : null}
          <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>QR-Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}