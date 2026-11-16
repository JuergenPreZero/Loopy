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
import { globalStyles } from '../theme';

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
      <View style={globalStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        
        <Animated.View style={[globalStyles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
          <View style={globalStyles.modalHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={globalStyles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={globalStyles.modalSubtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={handleClose} style={globalStyles.closeBtn}>
              <Text style={globalStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}