import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  UserIcon,
  QrCodeIcon,
  HistoryIcon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';

const LOCAL_COLORS = {
  primary: '#2563EB',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

interface NavbarProps {
  activePage: number;
  setActivePage: (page: number) => void;
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  return (
    <View style={styles.navbar}>
      {/* 1: Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActivePage(1)}
      >
        <HugeiconsIcon
          icon={Home01Icon}
          size={24}
          color={activePage === 1 ? LOCAL_COLORS.primary : LOCAL_COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* 2: History */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActivePage(2)}
      >
        <HugeiconsIcon
          icon={HistoryIcon}
          size={24}
          color={activePage === 2 ? LOCAL_COLORS.primary : LOCAL_COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* 3: QR-Code */}
      <TouchableOpacity
        style={[
          styles.qrButton,
          {
            backgroundColor: activePage === 3 ? LOCAL_COLORS.primary : LOCAL_COLORS.surface,
          },
        ]}
        onPress={() => setActivePage(3)}
      >
        <HugeiconsIcon
          icon={QrCodeIcon}
          size={26}
          color={activePage === 3 ? '#FFFFFF' : LOCAL_COLORS.primary}
        />
      </TouchableOpacity>

      {/* 4: Shop / Rewards */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActivePage(4)}
      >
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          size={24}
          color={activePage === 4 ? LOCAL_COLORS.primary : LOCAL_COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* 5: Profile */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setActivePage(5)}
      >
        <HugeiconsIcon
          icon={UserIcon}
          size={24}
          color={activePage === 5 ? LOCAL_COLORS.primary : LOCAL_COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    height: 70,
    backgroundColor: LOCAL_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: LOCAL_COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: LOCAL_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});