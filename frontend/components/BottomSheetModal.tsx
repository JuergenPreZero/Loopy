import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

const LOCAL_COLORS = {
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  closeBg: '#F1F5F9',
};

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function BottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetModalProps) {
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(600);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        bounciness: 4,
        speed: 12,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 220,
      useNativeDriver: false,
    }).start(onClose);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTextCol}>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: LOCAL_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: LOCAL_COLORS.border,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: LOCAL_COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LOCAL_COLORS.closeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});