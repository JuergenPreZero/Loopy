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
import BottomSheetModal from '../BottomSheetModal';

const LOCAL_COLORS = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  success: '#16A34A',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  tagTennisBg: '#FEF9C3',
  tagTennisText: '#854D0E',
  tagTextileBg: '#E0F2FE',
  tagTextileText: '#075985',
  tagShoesBg: '#FCE7F3',
  tagShoesText: '#9D174D',
};

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LOCAL_COLORS.primary} />
      </View>
    );
  }

  const firstName = user?.firstName || 'du';
  const co2Saved = (totalQuantity * 0.42).toFixed(1);
  const currentGuide = MATERIAL_GUIDES[selectedMaterial];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[LOCAL_COLORS.primary]}
          tintColor={LOCAL_COLORS.primary}
        />
      }
    >
      {/* Begrüßung */}
      <View style={styles.greetingBox}>
        <Text style={styles.title}>Hey {firstName},</Text>
        <Text style={styles.subtitle}>Schön, dass du wieder da bist!</Text>
      </View>

      {/* Hauptkarte: Bisher recycelt */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Bisher recycelt</Text>
        <Text style={styles.bigNumber}>{totalQuantity}</Text>
        <Text style={styles.cardFooterText}>
          Artikel wieder zurück in den Kreislauf gebracht
        </Text>
      </View>

      {/* Statistik-Kacheln */}
      <View style={styles.row}>
        <View style={[styles.card, styles.statCardLeft]}>
          <Text style={styles.statLabel}>Coins verdient</Text>
          <Text style={styles.statValuePrimary}>{earnedCoins}</Text>
          <Text style={styles.statSub}>ReCoins gesammelt</Text>
        </View>

        <View style={[styles.card, styles.statCardRight]}>
          <Text style={styles.statLabel}>CO₂ gespart</Text>
          <Text style={styles.statValueSuccess}>{co2Saved} kg</Text>
          <Text style={styles.statSub}>Emissionen verhindert</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.actionBtnLeft]}
          onPress={() => setActiveModal('stores')}
          activeOpacity={0.8}
        >
          {Location04Icon ? <HugeiconsIcon icon={Location04Icon} size={18} color="#FFFFFF" /> : null}
          <Text style={styles.buttonText}>Stationen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.actionBtnRight]}
          onPress={() => setActivePage?.(3)}
          activeOpacity={0.8}
        >
          {QrCodeIcon ? <HugeiconsIcon icon={QrCodeIcon} size={18} color="#FFFFFF" /> : null}
          <Text style={styles.buttonText}>QR-Code</Text>
        </TouchableOpacity>
      </View>

      {/* 3 Info-Kacheln nebeneinander */}
      <View style={styles.infoGrid}>
        <TouchableOpacity
          style={[styles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('howTo')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#FEF9C3' }]}>
            <Text style={styles.emojiText}>💡</Text>
          </View>
          <Text style={styles.homeInfoTitle} numberOfLines={1}>So funktioniert’s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('whatToDrop')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.emojiText}>📦</Text>
          </View>
          <Text style={styles.homeInfoTitle} numberOfLines={1}>Was einwerfen?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.homeInfoCard]}
          activeOpacity={0.75}
          onPress={() => setActiveModal('learnMore')}
        >
          <View style={[styles.smallEmojiBox, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.emojiText}>❓</Text>
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
        <View style={styles.mapContainer}>
          {React.createElement('iframe', {
            title: 'Loopy Store Heilbronn Map',
            src: `https://maps.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
            style: { border: 0, width: '100%', height: '100%', borderRadius: 16 },
            loading: 'lazy',
            allowFullScreen: true,
          })}
        </View>

        <View style={styles.storeCard}>
          <View style={styles.storeHeaderRow}>
            <Text style={styles.storeTitle}>Loopy Store Heilbronn</Text>
          </View>
          <View style={styles.addressRow}>
            <HugeiconsIcon icon={Location04Icon} size={16} color={LOCAL_COLORS.text} />
            <Text style={styles.addressText}>{STORE_ADDRESS}</Text>
          </View>
          <Text style={styles.storeDescription}>
            Unser erster Store. Hier steht bald die erste Loopy-Station.
          </Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: LOCAL_COLORS.tagTennisBg }]}>
              <Text style={[styles.tagText, { color: LOCAL_COLORS.tagTennisText }]}>🎾 Tennisbälle</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: LOCAL_COLORS.tagTextileBg }]}>
              <Text style={[styles.tagText, { color: LOCAL_COLORS.tagTextileText }]}>👕 T-Shirts</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: LOCAL_COLORS.tagShoesBg }]}>
              <Text style={[styles.tagText, { color: LOCAL_COLORS.tagShoesText }]}>👟 Laufschuhe</Text>
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
        <View style={styles.bottomSpacerLarge} />
      </BottomSheetModal>

      {/* Modal 2: So funktioniert’s */}
      <BottomSheetModal
        visible={activeModal === 'howTo'}
        onClose={() => setActiveModal(null)}
        title="So funktioniert’s"
        subtitle="In 3 Schritten zu deinen ersten ReCoins."
      >
        <View style={[styles.card, styles.stepCard]}>
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>QR-Code an der Station scannen</Text>
          </View>
          <Text style={styles.stepDescription}>
            Öffne deinen persönlichen QR-Code unten in der Leiste und halte ihn vor den Sensor der Loopy-Station. Die Einwurfklappe entriegelt sich sofort.
          </Text>
        </View>

        <View style={[styles.card, styles.stepCard]}>
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Artikel einwerfen</Text>
          </View>
          <Text style={styles.stepDescription}>
            Wirf deine Wertstoffe einzeln ein. Die integrierte Sensorik erkennt das Material automatisch und zählt deine Artikel in Echtzeit mit.
          </Text>
        </View>

        <View style={[styles.card, styles.stepCardLast]}>
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>ReCoins einlösen & genießen</Text>
          </View>
          <Text style={styles.stepDescription}>
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
            <Text style={styles.detailEmoji}>{currentGuide.emoji}</Text>
            <Text style={styles.detailCategoryName}>{currentGuide.label}</Text>
          </View>

          <Text style={styles.dosHeading}>DOs</Text>
          <View style={styles.dosBox}>
            {currentGuide.dos.map((line, index) => (
              <Text key={index} style={styles.ruleListText}>
                - {line}
              </Text>
            ))}
          </View>

          <Text style={styles.dontsHeading}>DON'Ts</Text>
          <View style={styles.dontsBox}>
            {currentGuide.donts.map((line, index) => (
              <Text key={index} style={styles.ruleListText}>
                - {line}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.bottomSpacerSmall} />
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeModal === 'learnMore'}
        onClose={() => setActiveModal(null)}
        title="Mehr erfahren"
        subtitle="How-to Videos und weitere Informationen rund um Loopy."
      >
        <View style={styles.videoPlaceholder} />
        <View style={styles.bottomSpacerSmall} />
      </BottomSheetModal>
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
  greetingBox: {
    marginBottom: 16,
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
  },
  card: {
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  cardLabel: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    marginBottom: 4,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: LOCAL_COLORS.text,
  },
  cardFooterText: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardLeft: {
    flex: 1,
    marginRight: 6,
    marginBottom: 0,
  },
  statCardRight: {
    flex: 1,
    marginLeft: 6,
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 13,
    color: LOCAL_COLORS.textMuted,
    marginBottom: 4,
  },
  statValuePrimary: {
    fontSize: 22,
    fontWeight: '700',
    color: LOCAL_COLORS.primary,
  },
  statValueSuccess: {
    fontSize: 22,
    fontWeight: '700',
    color: LOCAL_COLORS.success,
  },
  statSub: {
    fontSize: 12,
    color: LOCAL_COLORS.textMuted,
    marginTop: 2,
  },
  button: {
    backgroundColor: LOCAL_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLeft: {
    flex: 1,
    marginRight: 6,
    flexDirection: 'row',
  },
  actionBtnRight: {
    flex: 1,
    marginLeft: 6,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
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
  emojiText: {
    fontSize: 20,
  },
  homeInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  storeCard: {
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  storeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: LOCAL_COLORS.text,
    fontWeight: '500',
  },
  storeDescription: {
    fontSize: 13,
    color: LOCAL_COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeBtn: {
    backgroundColor: LOCAL_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  routeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepCard: {
    marginBottom: 12,
  },
  stepCardLast: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    marginBottom: 0,
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    lineHeight: 20,
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
    color: LOCAL_COLORS.textMuted,
  },
  materialTabTextActive: {
    color: LOCAL_COLORS.text,
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
  detailEmoji: {
    fontSize: 22,
  },
  detailCategoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
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
    backgroundColor: LOCAL_COLORS.primary,
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
    backgroundColor: LOCAL_COLORS.primaryLight,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playIcon: {
    fontSize: 18,
    color: LOCAL_COLORS.primary,
    marginLeft: 3,
  },
  videoPlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: LOCAL_COLORS.textMuted,
  },
  bottomSpacerSmall: {
    height: 16,
  },
  bottomSpacerLarge: {
    height: 24,
  },
});