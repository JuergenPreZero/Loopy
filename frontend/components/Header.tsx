import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet } from 'react-native';
import { useUser } from './UserContext';

const LOCAL_COLORS = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

export default function Header() {
  const { balance } = useUser();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      <StatusBar backgroundColor={LOCAL_COLORS.surface} barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.pillBadge}>
          <Text style={styles.badgeText}>
            {formattedTime}
          </Text>
        </View>

        <View style={styles.pillBadge}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.badgeText}>
            {balance} ReCoins
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: LOCAL_COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: LOCAL_COLORS.border,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LOCAL_COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.primaryBorder,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LOCAL_COLORS.primary,
    marginRight: 8,
  },
  coinEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: LOCAL_COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
});