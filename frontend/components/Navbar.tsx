import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  UserIcon,
  QrCodeIcon,
  HistoryIcon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import { colors } from '../theme';

interface NavbarProps {
  activePage: number;
  setActivePage: (page: number) => void;
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  return (
    <View
      style={{
        width: '100%',
        height: 70,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {/* 1: Home */}
      <TouchableOpacity
        style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => setActivePage(1)}
      >
        <HugeiconsIcon
          icon={Home01Icon}
          size={24}
          color={activePage === 1 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      {/* 2: History */}
      <TouchableOpacity
        style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => setActivePage(2)}
      >
        <HugeiconsIcon
          icon={HistoryIcon}
          size={24}
          color={activePage === 2 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      {/* 3: QR-Code */}
      <TouchableOpacity
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          borderWidth: 2,
          borderColor: colors.primary,
          backgroundColor: activePage === 3 ? colors.primary : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setActivePage(3)}
      >
        <HugeiconsIcon
          icon={QrCodeIcon}
          size={26}
          color={activePage === 3 ? '#FFFFFF' : colors.primary}
        />
      </TouchableOpacity>

      {/* 4: Shop / Rewards */}
      <TouchableOpacity
        style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => setActivePage(4)}
      >
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          size={24}
          color={activePage === 4 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      {/* 5: Profile */}
      <TouchableOpacity
        style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => setActivePage(5)}
      >
        <HugeiconsIcon
          icon={UserIcon}
          size={24}
          color={activePage === 5 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}