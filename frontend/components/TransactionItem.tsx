import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TransactionProps {
  itemType: string;
  amount?: number | null;
  weight?: number | null;
  value: number;
  date?: string;
}

export default function TransactionItem({
  itemType,
  amount,
  weight,
  value,
  date,
}: TransactionProps) {
  const isPositive = value >= 0;

  const formatShortDate = (rawDate?: string) => {
    if (!rawDate) return null;
    try {
      const isoString = rawDate.replace(' ', 'T');
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return rawDate.substring(0, 16);

      return `${d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })} Uhr`;
    } catch {
      return rawDate;
    }
  };

  const formatWeight = (kg: number) => {
    if (kg < 1) {
      const grams = Math.round(kg * 1000);
      return `${grams.toLocaleString('de-DE')} g`;
    }
    return `${kg.toLocaleString('de-DE', { maximumFractionDigits: 2 })} kg`;
  };

    const renderSubtitle = () => {
    if (!isPositive) {
      const count = amount ?? 1;
      return `${count} ${count === 1 ? 'Prämie' : 'Prämien'} eingelöst`;
    }

    const hasWeight = weight !== null && weight !== undefined;
    const hasAmount = amount !== null && amount !== undefined;

    if (hasWeight && hasAmount) {
      return `${amount} Stück (${formatWeight(weight)}) abgegeben`;
    }
    if (hasWeight) {
      return `${formatWeight(weight)} abgegeben`;
    }
    if (hasAmount) {
      return `${amount} Stück abgegeben`;
    }

    return 'Abgegeben';
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <Text style={styles.itemName}>{itemType}</Text>
        <Text style={styles.itemAmount}>{renderSubtitle()}</Text>
        {date ? <Text style={styles.itemDate}>{formatShortDate(date)}</Text> : null}
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.totalValue,
            isPositive ? styles.positiveValue : styles.negativeValue,
          ]}
        >
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
    alignItems: 'flex-start',
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
    marginRight: 18,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 22,
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
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },
  positiveValue: {
    color: '#16A34A',
  },
  negativeValue: {
    color: '#DC2626',
  },
});