import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  QrCodeIcon,
  Location04Icon,
  Navigation03Icon,
} from '@hugeicons/core-free-icons';
import { useUser } from '../UserContext';
import { globalStyles, colors } from '../../theme';

import BottomSheetModal from '../BottomSheetModal';

interface HomeScreenProps {
  userId?: string;
  setActivePage?: (page: number) => void;
}

const STORE_ADDRESS = 'Gerberstraße 19, 74072 Heilbronn';
type ActiveModalType = 'stores' | 'howTo' | 'whatToDrop' | 'learnMore' | null;
type MaterialKey = 'tennis' | 'tshirts' | 'shoes';

interface MaterialGuide {
  key: MaterialKey;
  label: string;
  emoji: string;
  dos: string[];
  donts: string[];
}

const MATERIAL_GUIDES: Record<MaterialKey, MaterialGuide> = {
  tennis: {
    key: 'tennis',
    label: 'Tennisbälle',
    emoji: '🎾',
    dos: [
      'Saubere und trockene Tennisbälle',
      'Gebrauchte Trainings- und Matchbälle',
      'Einzeln nacheinander in die Station einwerfen',
    ],
    donts: [
      'Nasse, schlammige oder stark verschmutzte Bälle',
      'Aufgerissene, geplatzte oder stark beschädigte Bälle',
      'Andere Ballarten (z. B. Golf-, Tischtennis- oder Fußbälle)',
    ],
  },
  tshirts: {
    key: 'tshirts',
    label: 'T-Shirts',
    emoji: '👕',
    dos: [
      'Saubere und trockene T-Shirts aller Art',
      'Baumwoll- und Funktionsshirts (auch mit Aufdruck)',
      'Einzeln und unverknotet in das Fach legen',
    ],
    donts: [
      'Nasse, feuchte oder verschimmelte Kleidung',
      'Stark verschmutzte oder mit Chemikalien/Öl behaftete Stoffe',
      'Jacken, Hosen, Pullover, Socken oder Unterwäsche',
    ],
  },
  shoes: {
    key: 'shoes',
    label: 'Laufschuhe',
    emoji: '👟',
    dos: [
      'Saubere und trockene Laufschuhe',
      'Immer paarweise an den Schnürsenkeln zusammengebunden',
      'Gut erhaltene sowie abgelaufene Sportschuhe',
    ],
    donts: [
      'Einzelschuhe ohne passendes Gegenstück',
      'Nasse, stark verschlammte oder schimmelige Schuhe',
      'Straßenschuhe, Stiefel, Absätze oder Sandalen',
    ],
  },
};

export default function HomeScreen({ setActivePage }: HomeScreenProps) {
  const { user, totalQuantity, earnedCoins, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialKey>('tennis');

  useEffect(() => {
    refreshData();
  }, []);

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
  const currentGuide = MATERIAL_GUIDES[selectedMaterial];

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
      {/* Begrüßung */}
      <View style={{ marginBottom: 16 }}>
        <Text style={globalStyles.title}>Hey {firstName},</Text>
        <Text style={globalStyles.subtitle}>Schön, dass du wieder da bist!</Text>
      </View>

      {/* Hauptkarte: Bisher recycelt */}
      <View style={globalStyles.card}>
        <Text style={[globalStyles.subtitle, { marginBottom: 4 }]}>Bisher recycelt</Text>
        <Text style={globalStyles.bigNumber}>{totalQuantity}</Text>
        <Text style={[globalStyles.subtitle, { marginBottom: 0, marginTop: 8 }]}>
          Artikel wieder zurück in den Kreislauf gebracht
        </Text>
      </View>

      {/* Statistik-Kacheln */}
      <View style={[globalStyles.row, { marginBottom: 16 }]}>
        <View style={[globalStyles.card, { flex: 1, marginRight: 6, marginBottom: 0 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 4, fontSize: 13 }]}>Coins verdient</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.primary }}>{earnedCoins}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>ReCoins gesammelt</Text>
        </View>

        <View style={[globalStyles.card, { flex: 1, marginLeft: 6, marginBottom: 0 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 4, fontSize: 13 }]}>CO₂ gespart</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.success }}>{co2Saved} kg</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Emissionen verhindert</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[globalStyles.row, { marginBottom: 16 }]}>
        <TouchableOpacity
          style={[globalStyles.button, { flex: 1, marginRight: 6, flexDirection: 'row', justifyContent: 'center' }]}
          onPress={() => setActiveModal('stores')}
          activeOpacity={0.8}
        >
          {Location04Icon ? <HugeiconsIcon icon={Location04Icon} size={18} color="#FFFFFF" /> : null}
          <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Stationen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, { flex: 1, marginLeft: 6, flexDirection: 'row', justifyContent: 'center' }]}
          onPress={() => setActivePage?.(3)}
          activeOpacity={0.8}
        >
          {QrCodeIcon ? <HugeiconsIcon icon={QrCodeIcon} size={18} color="#FFFFFF" /> : null}
          <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>QR-Code</Text>
        </TouchableOpacity>
      </View>

      {/* 3 Info-Kacheln nebeneinander */}
      <View style={styles.infoGrid}>
        <TouchableOpacity
          style={[globalStyles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('howTo')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#FEF9C3' }]}>
            <Text style={{ fontSize: 20 }}>💡</Text>
          </View>
          <Text style={styles.homeInfoTitle} numberOfLines={1}>So funktioniert’s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('whatToDrop')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={{ fontSize: 20 }}>📦</Text>
          </View>
          <Text style={styles.homeInfoTitle} numberOfLines={1}>Was einwerfen?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('learnMore')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#EDE9FE' }]}>
            <Text style={{ fontSize: 20 }}>❓</Text>
          </View>
          <Text style={styles.homeInfoTitle} numberOfLines={1}>Mehr erfahren</Text>
        </TouchableOpacity>
      </View>

      {/* Modal 1: Stationen */}
      <BottomSheetModal
        visible={activeModal === 'stores'}
        onClose={() => setActiveModal(null)}
        title="Stationen"
        subtitle="Hier kannst du deine Wertstoffe abgeben."
      >
        <View style={globalStyles.mapContainer}>
          {React.createElement('iframe', {
            title: 'Loopy Store Heilbronn Map',
            src: `https://maps.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
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
          <Text style={globalStyles.storeDescription}>
            Unser erster Store. Hier steht bald die erste Loopy-Station.
          </Text>
          <View style={globalStyles.tagsContainer}>
            <View style={[globalStyles.tag, { backgroundColor: colors.tagTennisBg }]}>
              <Text style={[globalStyles.tagText, { color: colors.tagTennisText }]}>🎾 Tennisbälle</Text>
            </View>
            <View style={[globalStyles.tag, { backgroundColor: colors.tagTextileBg }]}>
              <Text style={[globalStyles.tagText, { color: colors.tagTextileText }]}>👕 T-Shirts</Text>
            </View>
            <View style={[globalStyles.tag, { backgroundColor: colors.tagShoesBg }]}>
              <Text style={[globalStyles.tagText, { color: colors.tagShoesText }]}>👟 Laufschuhe</Text>
            </View>
          </View>
          <TouchableOpacity
            style={globalStyles.routeBtn}
            activeOpacity={0.8}
            onPress={() => openExternalMaps(STORE_ADDRESS)}
          >
            <HugeiconsIcon icon={Navigation03Icon} size={18} color="#FFFFFF" />
            <Text style={globalStyles.routeBtnText}>Route planen</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </BottomSheetModal>

      {/* Modal 2: So funktioniert’s */}
      <BottomSheetModal
        visible={activeModal === 'howTo'}
        onClose={() => setActiveModal(null)}
        title="So funktioniert’s"
        subtitle="In 3 Schritten zu deinen ersten ReCoins."
      >
        <View style={[globalStyles.card, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>1</Text>
            </View>
            <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>
              QR-Code an der Station scannen
            </Text>
          </View>
          <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
            Öffne deinen persönlichen QR-Code unten in der Leiste und halte ihn vor den Sensor der Loopy-Station. Die Einwurfklappe entriegelt sich sofort.
          </Text>
        </View>

        <View style={[globalStyles.card, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>2</Text>
            </View>
            <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>
              Artikel einwerfen
            </Text>
          </View>
          <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
            Wirf deine Wertstoffe einzeln ein. Die integrierte Sensorik erkennt das Material automatisch und zählt deine Artikel in Echtzeit mit.
          </Text>
        </View>

        <View style={[globalStyles.card, { marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>3</Text>
            </View>
            <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 0 }]}>
              ReCoins einlösen & genießen
            </Text>
          </View>
          <Text style={[globalStyles.subtitle, { fontSize: 14, lineHeight: 20, marginBottom: 0 }]}>
            Deine ReCoins werden deinem Konto direkt gutgeschrieben. Löse sie im Shop gegen Backwaren oder Gutscheine bei lokalen Partnern ein.
          </Text>
        </View>
      </BottomSheetModal>

      {/* Modal 3: Was einwerfen? (Abgabe vorbereiten) */}
      <BottomSheetModal
        visible={activeModal === 'whatToDrop'}
        onClose={() => setActiveModal(null)}
        title="Abgabe vorbereiten"
        subtitle="Wähle ein Material aus, um zu sehen, was wir annehmen und was du beachten solltest."
      >
        <View style={styles.tabRow}>
          {(['tennis', 'tshirts', 'shoes'] as MaterialKey[]).map((key) => {
            const item = MATERIAL_GUIDES[key];
            const isActive = selectedMaterial === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.materialTab, isActive && styles.materialTabActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedMaterial(key)}
              >
                <Text style={[styles.materialTabText, isActive && styles.materialTabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.materialDetailCard}>
          <View style={styles.detailHeader}>
            <Text style={{ fontSize: 22 }}>{currentGuide.emoji}</Text>
            <Text style={styles.detailCategoryName}>{currentGuide.label}</Text>
          </View>

          <Text style={styles.dosHeading}>DOs</Text>
          <View style={styles.dosBox}>
            {currentGuide.dos.map((line, index) => (
              <Text key={index} style={styles.ruleListText}>
                • {line}
              </Text>
            ))}
          </View>

          <Text style={styles.dontsHeading}>DON'Ts</Text>
          <View style={styles.dontsBox}>
            {currentGuide.donts.map((line, index) => (
              <Text key={index} style={styles.ruleListText}>
                • {line}
              </Text>
            ))}
          </View>
        </View>
        <View style={{ height: 16 }} />
      </BottomSheetModal>

      {/* Modal 4: Mehr erfahren (Platzhalter für How-to Videos) */}
      <BottomSheetModal
        visible={activeModal === 'learnMore'}
        onClose={() => setActiveModal(null)}
        title="Mehr erfahren"
        subtitle="How-to Videos und weitere Informationen rund um Loopy."
      >
        <View style={styles.videoPlaceholder}>
        </View>
        <View style={{ height: 16 }} />
      </BottomSheetModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  homeInfoCard: {
    flex: 1,
    marginBottom: 0,
    padding: 12,
    alignItems: 'center',
  },
  smallEmojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  homeInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  materialTab: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  materialTabActive: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  materialTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  materialTabTextActive: {
    color: colors.text,
  },
  materialDetailCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailCategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dosHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },
  dosBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  dontsHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
  },
  dontsBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  ruleListText: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 19,
    marginBottom: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepCircleText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playIcon: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 3,
  },
  videoPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
});