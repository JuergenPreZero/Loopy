import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TransactionProps {
  itemType: string;
  amount: number;
  value: number;
  date?: string;
}

export default function TransactionItem({ itemType, amount, value, date }: TransactionProps) {
  const isPositive = value >= 0;

  const formatShortDate = (rawDate?: string) => {
    if (!rawDate) return null;
    try {
      const isoString = rawDate.replace(' ', 'T');
      const d = new Date(isoString);

      if (isNaN(d.getTime())) {
        return rawDate.substring(0, 16);
      }

      const formatted = d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `${formatted} Uhr`;
    } catch {
      return rawDate;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.itemName}>{itemType}</Text>
        <Text style={styles.itemAmount}>
          {isPositive ? `${amount} Stück abgegeben` : `${amount}x Prämie eingelöst`}
        </Text>
        {date ? <Text style={styles.itemDate}>{formatShortDate(date)}</Text> : null}
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.totalValue, isPositive ? styles.positiveValue : styles.negativeValue]}>
          {isPositive ? `+${value}` : value} ReCoins
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  leftCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemAmount: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  positiveValue: {
    color: '#16A34A',
  },
  negativeValue: {
    color: '#DC2626',
  },
});