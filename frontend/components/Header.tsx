import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { fetchUserBalance } from '../api';
import { colors } from '../theme';

interface HeaderProps {
  userId: string;
}

export default function Header({ userId }: HeaderProps) {
  const [balance, setBalance] = useState<number>(0);

  const loadBalance = useCallback(async () => {
    if (!userId) return;
    try {
      const current = await fetchUserBalance(userId);
      setBalance(current);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [userId]);

  useEffect(() => {
    loadBalance();
    const interval = setInterval(loadBalance, 5000);
    return () => clearInterval(interval);
  }, [loadBalance]);

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