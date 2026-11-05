import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2563EB',        // Hauptblau
  primaryLight: '#EFF6FF',   // Helles Blau für Badges/Pills
  primaryBorder: '#BFDBFE',  // Rand für Badges
  background: '#F8FAFC',     // Hintergrund der Screens
  surface: '#FFFFFF',        // Karten & Boxen
  text: '#0F172A',           // Haupttext / Titel
  textMuted: '#64748B',      // Beschreibungen, dezentere Links
  border: '#E2E8F0',         // Trennlinien
  
  // Statusfarben & Banner
  danger: '#EF4444',         // Rot für Logout / Warnung / Fehler
  dangerLight: '#FEE2E2',    // Helles Rot für Fehler-Banner
  dangerBorder: '#FCA5A5',   // Rahmen für Fehler-Banner
  
  success: '#16A34A',        // Grün für positive Werte / Erfolge
  successLight: '#DCFCE7',   // Helles Grün für Erfolgs-Banner
  successBorder: '#86EFAC',  // Rahmen für Erfolgs-Banner
  successDark: '#166534',    // Dunkelgrüner Text für Erfolgs-Banner

  // Tag-Farben (Store-Kategorien)
  tagTennisBg: '#ECFCCB',
  tagTennisText: '#4D7C0F',
  tagTextileBg: '#E0F2FE',
  tagTextileText: '#0369A1',
  tagShoesBg: '#FFEDD5',
  tagShoesText: '#C2410C',
  
  routeButton: '#0F4C5C',
};

export const globalStyles = StyleSheet.create({
  // Layout & Container
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Typografie
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
  },

  // Karten
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.textMuted,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Formulare & Inputs
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },

  // Feedback-Banner (Erfolg & Fehler)
  bannerSuccess: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  bannerSuccessText: {
    color: colors.successDark,
    fontWeight: '600',
    fontSize: 14,
  },
  bannerError: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  bannerErrorText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },

  // Shop & Mengen-Controls
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 0,
    marginRight: 8,
    borderRadius: 20,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: -2,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  checkoutBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkoutBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  // Modals & Overlays
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: 'bold',
  },

  // Stores & Maps
  mapContainer: {
    height: 200,
    backgroundColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 6,
  },
  storeDescription: {
    fontSize: 14,
    color: colors.textMuted,
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
    backgroundColor: colors.routeButton,
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