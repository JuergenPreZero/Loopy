import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles, colors } from '../theme';

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
    <View style={[globalStyles.card, { marginBottom: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View>
          <Text style={[globalStyles.title, { fontSize: 15, marginBottom: 2 }]}>
            Recycle-Profi
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {remainingItems > 0
              ? `Noch ${remainingItems} Artikel bis zum Meilenstein`
              : 'Meilenstein erreicht!'}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
          {progress}%
        </Text>
      </View>

      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: colors.primary,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}