import React, { useState, useRef, useEffect } from 'react';
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
const TARGET_ITEMS = 100;

export default function HomeScreen({ setActivePage }: HomeScreenProps) {
  const { user, totalQuantity, earnedCoins, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showStoresModal, setShowStoresModal] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const [showDosDontsModal, setShowDosDontsModal] = useState(false);

  const slideAnimStores = useRef(new Animated.Value(600)).current;
  const slideAnimHowTo = useRef(new Animated.Value(600)).current;
  const slideAnimDosDonts = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    refreshData();
  }, []);

  // Einfache Fortschrittsberechnung (Ziel: 100 Artikel)
  const progress = Math.min(100, Math.round((totalQuantity / TARGET_ITEMS) * 100));
  const remainingItems = Math.max(0, TARGET_ITEMS - totalQuantity);

  const openStoresModal = () => {
    slideAnimStores.setValue(600);
    setShowStoresModal(true);
    Animated.spring(slideAnimStores, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 12 }).start();
  };

  const closeStoresModal = () => {
    Animated.timing(slideAnimStores, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setShowStoresModal(false);
    });
  };

  const openHowToModal = () => {
    slideAnimHowTo.setValue(600);
    setShowHowToModal(true);
    Animated.spring(slideAnimHowTo, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 12 }).start();
  };

  const closeHowToModal = () => {
    Animated.timing(slideAnimHowTo, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setShowHowToModal(false);
    });
  };

  const openDosDontsModal = () => {
    slideAnimDosDonts.setValue(600);
    setShowDosDontsModal(true);
    Animated.spring(slideAnimDosDonts, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 12 }).start();
  };

  const closeDosDontsModal = () => {
    Animated.timing(slideAnimDosDonts, { toValue: 600, duration: 220, useNativeDriver: true }).start(() => {
      setShowDosDontsModal(false);
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
            {earnedCoins}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>ReCoins gesammelt</Text>
        </View>

        <View style={[globalStyles.card, { flex: 1, marginLeft: 6, marginBottom: 0 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 4, fontSize: 13 }]}>CO₂ gespart</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.success }}>
            {co2Saved} kg
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Emissionen verhindert</Text>
        </View>
      </View>

      {/* Schlanker Fortschrittsbalken: Recycle-Profi */}
      <View style={[globalStyles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View>
            <Text style={[globalStyles.title, { fontSize: 15, marginBottom: 2 }]}>
              Recycle-Profi
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              {remainingItems > 0
                ? `Noch ${remainingItems} Artikel bis zum Meilenstein`
                : 'Meilenstein erreicht!'}
            </Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
            {progress}%
          </Text>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor: colors.border,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: colors.primary,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Quick Actions */}
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

      {/* Info-Kacheln nebeneinander */}
      <View style={[globalStyles.row, { marginTop: 16 }]}>
        <TouchableOpacity
          style={[
            globalStyles.card,
            {
              flex: 1,
              marginRight: 6,
              marginBottom: 0,
              padding: 14,
            },
          ]}
          activeOpacity={0.7}
          onPress={openHowToModal}
        >
          <View style={[globalStyles.iconPlaceholder, { backgroundColor: '#EFF6FF', marginBottom: 10 }]}>
            <Text style={{ fontSize: 20 }}>💡</Text>
          </View>
          <Text style={[globalStyles.title, { fontSize: 15, marginBottom: 2 }]}>
            Anleitung
          </Text>
          <Text style={[globalStyles.subtitle, { fontSize: 12, marginBottom: 0 }]} numberOfLines={2}>
            So läuft der Einwurf in 3 Schritten ab
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            globalStyles.card,
            {
              flex: 1,
              marginLeft: 6,
              marginBottom: 0,
              padding: 14,
            },
          ]}
          activeOpacity={0.7}
          onPress={openDosDontsModal}
        >
          <View style={[globalStyles.iconPlaceholder, { backgroundColor: '#F0FDF4', marginBottom: 10 }]}>
            <Text style={{ fontSize: 20 }}>📋</Text>
          </View>
          <Text style={[globalStyles.title, { fontSize: 15, marginBottom: 2 }]}>
            Do's & Don'ts
          </Text>
          <Text style={[globalStyles.subtitle, { fontSize: 12, marginBottom: 0 }]} numberOfLines={2}>
            Erlaubte Artikel & Sortier-Regeln
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. Modal: Anleitung */}
      <Modal visible={showHowToModal} animationType="fade" transparent={true} onRequestClose={closeHowToModal}>
        <View style={globalStyles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeHowToModal} />
          <Animated.View style={[globalStyles.modalCard, { transform: [{ translateY: slideAnimHowTo }] }]}>
            <View style={globalStyles.modalHeader}>
              <View>
                <Text style={globalStyles.modalTitle}>So funktioniert’s</Text>
                <Text style={globalStyles.modalSubtitle}>In 3 Schritten zu deinen ersten ReCoins.</Text>
              </View>
              <TouchableOpacity onPress={closeHowToModal} style={globalStyles.closeBtn}>
                <Text style={globalStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={[globalStyles.card, { marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>1</Text>
                  </View>
                  <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>QR-Code an der Station scannen</Text>
                </View>
                <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
                  Öffne deinen persönlichen QR-Code unten in der Leiste und halte ihn vor den Sensor der Loopy-Station. Die Einwurfklappe entriegelt sich sofort.
                </Text>
              </View>

              <View style={[globalStyles.card, { marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>2</Text>
                  </View>
                  <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>Artikel einwerfen</Text>
                </View>
                <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
                  Wirf deine Wertstoffe einzeln ein. Die integrierte Sensorik erkennt das Material automatisch und zählt deine Artikel in Echtzeit mit.
                </Text>
              </View>

              <View style={[globalStyles.card, { marginBottom: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>3</Text>
                  </View>
                  <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>ReCoins einlösen & genießen</Text>
                </View>
                <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
                  Deine ReCoins werden deinem Konto direkt gutgeschrieben. Löse sie im Shop gegen Backwaren, Smoothies oder Gutscheine bei lokalen Partnern ein.
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* 2. Modal: Do's & Don'ts */}
      <Modal visible={showDosDontsModal} animationType="fade" transparent={true} onRequestClose={closeDosDontsModal}>
        <View style={globalStyles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeDosDontsModal} />
          <Animated.View style={[globalStyles.modalCard, { transform: [{ translateY: slideAnimDosDonts }] }]}>
            <View style={globalStyles.modalHeader}>
              <View>
                <Text style={globalStyles.modalTitle}>Do's & Don'ts</Text>
                <Text style={globalStyles.modalSubtitle}>Was gehört in die Loopy-Station?</Text>
              </View>
              <TouchableOpacity onPress={closeDosDontsModal} style={globalStyles.closeBtn}>
                <Text style={globalStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={{ backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BBF7D0' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#166534', marginBottom: 12 }}>✓ Das gehört rein (Do's)</Text>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>🎾 Tennis- & Padelbälle</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Alle Standard-Filzbälle – egal ob abgenutzt, drucklos oder beschädigt. Bitte einzeln einwerfen.</Text>
                </View>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>👟 Lauf- & Sportschuhe</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Sneaker, Laufschuhe und Hallenschuhe. Bitte paarweise zusammengebunden einwerfen.</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>👕 Sporttextilien & Shirts</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Synthetische Sportshirts, Trikots und Sporthosen im trockenen Zustand.</Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 0, borderWidth: 1, borderColor: '#FECACA' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 12 }}>✕ Das gehört NICHT rein (Don'ts)</Text>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>🚫 Hausmüll, Plastikverpackungen & Dosen</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Getränkedosen und PET-Flaschen bitte im herkömmlichen Pfandautomaten abgeben.</Text>
                </View>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>🚫 Nasse oder verschimmelte Kleidung</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Feuchte Textilien beschädigen den gesamten Sammelbehälter und blockieren die Verwertung.</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>🚫 Straßenschuhe, Stiefel & Einzelschuhe</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Keine Lederschuhe, Absätze oder Winterschuhe einwerfen; Schuhe immer als Paar abgeben.</Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* 3. Modal: Stores & Map */}
      <Modal visible={showStoresModal} animationType="fade" transparent={true} onRequestClose={closeStoresModal}>
        <View style={globalStyles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeStoresModal} />
          <Animated.View style={[globalStyles.modalCard, { transform: [{ translateY: slideAnimStores }] }]}>
            <View style={globalStyles.modalHeader}>
              <View>
                <Text style={globalStyles.modalTitle}>Stores</Text>
                <Text style={globalStyles.modalSubtitle}>Hier kannst du deine Wertstoffe abgeben.</Text>
              </View>
              <TouchableOpacity onPress={closeStoresModal} style={globalStyles.closeBtn}>
                <Text style={globalStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={globalStyles.mapContainer}>
                {React.createElement('iframe', {
                  title: 'Loopy Store Heilbronn Map',
                  src: 'https://maps.google.com/maps?q=Gerberstra%C3%9Fe%2019%2C%2074072%20Heilbronn&t=&z=16&ie=UTF8&iwloc=&output=embed',
                  style: { border: 0, width: '100%', height: '100%', borderRadius: 16 },
                  loading: 'lazy',
                  allowFullScreen: true,
                })}
              </View>

              <View style={globalStyles.storeCard}>
                <View style={globalStyles.storeHeaderRow}>
                  <Text style={globalStyles.storeTitle}>Loopy Store Heilbronn</Text>
                </View>
                <View style={globalStyles.addressRow}>
                  <HugeiconsIcon icon={Location04Icon} size={16} color={colors.text} />
                  <Text style={globalStyles.addressText}>{STORE_ADDRESS}</Text>
                </View>
                <Text style={globalStyles.storeDescription}>Unser erster Store. Hier steht bald die erste Loopy-Station.</Text>
                <View style={globalStyles.tagsContainer}>
                  <View style={[globalStyles.tag, { backgroundColor: colors.tagTennisBg }]}>
                    <Text style={[globalStyles.tagText, { color: colors.tagTennisText }]}>🎾 Tennisbälle</Text>
                  </View>
                  <View style={[globalStyles.tag, { backgroundColor: colors.tagTextileBg }]}>
                    <Text style={[globalStyles.tagText, { color: colors.tagTextileText }]}>👕 Textilien</Text>
                  </View>
                  <View style={[globalStyles.tag, { backgroundColor: colors.tagShoesBg }]}>
                    <Text style={[globalStyles.tagText, { color: colors.tagShoesText }]}>👟 Laufschuhe</Text>
                  </View>
                </View>
                <TouchableOpacity style={globalStyles.routeBtn} activeOpacity={0.8} onPress={() => openExternalMaps(STORE_ADDRESS)}>
                  <HugeiconsIcon icon={Navigation03Icon} size={18} color="#FFFFFF" />
                  <Text style={globalStyles.routeBtnText}>Route planen</Text>
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