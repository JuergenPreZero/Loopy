import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useUser } from './UserContext';
import { colors } from '../theme';

export default function Header() {
  const { balance } = useUser();

  return (
    <>
      <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
      <View
        style={{
          backgroundColor: colors.surface,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primaryLight,
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>🪙</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
            {balance} ReCoins
          </Text>
        </View>
      </View>
    </>
  );
}