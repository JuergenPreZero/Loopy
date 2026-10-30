import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Linking,
  Animated,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  QrCodeIcon, 
  Location04Icon,
  Navigation03Icon,
} from '@hugeicons/core-free-icons';
import { useUser } from '../UserContext';
import { globalStyles, colors } from '../../theme';

interface HomeScreenProps {
  userId?: string;
  setActivePage?: (page: number) => void;
}

const STORE_ADDRESS = 'Gerberstraße 19, 74072 Heilbronn';

export default function HomeScreen({ setActivePage }: HomeScreenProps) {
  const { user, totalQuantity, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStoresModal, setShowStoresModal] = useState(false);

  // Animationswert für das Hochgleiten der Karte
  const slideAnim = useRef(new Animated.Value(600)).current;

  const openStoresModal = () => {
    slideAnim.setValue(600);
    setShowStoresModal(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  const closeStoresModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowStoresModal(false);
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const openExternalMaps = (address: string) => {
    const query = encodeURIComponent(address);
    let isIOS = false;
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    const url = isIOS
      ? `https://maps.apple.com/?daddr=${query}`
      : `https://www.google.com/maps/dir/?api=1&destination=${query}`;

    Linking.openURL(url).catch((err) =>
      console.error('Karten-App konnte nicht geöffnet werden:', err)
    );
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
          onPress={openStoresModal}
          activeOpacity={0.8}
        >
          {Location04Icon ? (
            <HugeiconsIcon icon={Location04Icon} size={18} color="#FFFFFF" />
          ) : null}
          <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Stationen</Text>
        </TouchableOpacity>

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

      {/* --- STORES MODAL --- */}
      <Modal
        visible={showStoresModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeStoresModal}
      >
        <View style={styles.modalOverlay}>
          {/* Klick außerhalb des Modals schließt das Fenster */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeStoresModal}
          />

          {/* Animierte Karte, die von unten hochfliegt */}
          <Animated.View
            style={[
              styles.modalCard,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Stores</Text>
                <Text style={styles.modalSubtitle}>
                  Hier kannst du deine Wertstoffe abgeben.
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeStoresModal}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Voll interaktive Karte */}
              <View style={styles.mapContainer}>
                {React.createElement('iframe', {
                  title: 'Loopy Store Heilbronn Map',
                  src: 'https://maps.google.com/maps?q=Gerberstra%C3%9Fe%2019%2C%2074072%20Heilbronn&t=&z=16&ie=UTF8&iwloc=&output=embed',
                  style: {
                    border: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 16,
                  },
                  loading: 'lazy',
                  allowFullScreen: true,
                })}
              </View>

              {/* Store Detail-Karte */}
              <View style={styles.storeCard}>
                <View style={styles.storeHeaderRow}>
                  <Text style={styles.storeTitle}>Loopy Store Heilbronn</Text>
                </View>

                <View style={styles.addressRow}>
                  <HugeiconsIcon icon={Location04Icon} size={16} color="#0F172A" />
                  <Text style={styles.addressText}>{STORE_ADDRESS}</Text>
                </View>

                <Text style={styles.storeDescription}>
                  Unser erster Store. Hier steht bald die erste Loopy-Station.
                </Text>

                <View style={styles.tagsContainer}>
                  <View style={[styles.tag, { backgroundColor: '#ECFCCB' }]}>
                    <Text style={[styles.tagText, { color: '#4D7C0F' }]}>🎾 Tennisbälle</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.tagText, { color: '#0369A1' }]}>👕 Textilien</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: '#FFEDD5' }]}>
                    <Text style={[styles.tagText, { color: '#C2410C' }]}>👟 Laufschuhe</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.routeBtn}
                  activeOpacity={0.8}
                  onPress={() => openExternalMaps(STORE_ADDRESS)}
                >
                  <HugeiconsIcon icon={Navigation03Icon} size={18} color="#FFFFFF" />
                  <Text style={styles.routeBtnText}>Route planen</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 24 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 240,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    marginLeft: 6,
  },
  storeDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  routeBtn: {
    backgroundColor: '#0F4C5C',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});