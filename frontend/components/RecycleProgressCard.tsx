import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LOCAL_COLORS = {
  primary: '#2563EB',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

interface RecycleProgressCardProps {
  totalQuantity: number;
  targetItems?: number;
}

export default function RecycleProgressCard({
  totalQuantity,
  targetItems = 100,
}: RecycleProgressCardProps) {
  const progress = Math.min(100, Math.round((totalQuantity / targetItems) * 100));
  const remainingItems = Math.max(0, targetItems - totalQuantity);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Recycle-Profi</Text>
          <Text style={styles.subtitle}>
            {remainingItems > 0
              ? `Noch ${remainingItems} Artikel bis zum Meilenstein`
              : 'Meilenstein erreicht!'}
          </Text>
        </View>
        <Text style={styles.percentText}>{progress}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: LOCAL_COLORS.textMuted,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '700',
    color: LOCAL_COLORS.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: LOCAL_COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: LOCAL_COLORS.primary,
    borderRadius: 4,
  },
});