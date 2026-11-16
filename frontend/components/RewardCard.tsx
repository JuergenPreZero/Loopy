import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Delete02Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { Reward } from '../api';
import { colors } from '../theme';

interface RewardCardProps {
  reward: Reward;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  isAdmin?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const LOCAL_ASSET_IMAGES: Record<string, ImageSourcePropType> = {
  'croissant.jpg': require('../assets/croissant.jpg'),
  'broetchen.jpg': require('../assets/broetchen.jpg'),
  'kaffee.jpg': require('../assets/kaffee.jpg'),
  'krustenbrot.jpg': require('../assets/krustenbrot.jpg'),
};

function getRewardImageSource(url?: string | null): ImageSourcePropType | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return { uri: url };
  }
  return LOCAL_ASSET_IMAGES[url] || null;
}

export default function RewardCard({
  reward,
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  isAdmin = false,
  onDelete,
  isDeleting = false,
}: RewardCardProps) {
  const [imageError, setImageError] = useState(false);

  const imageSource = getRewardImageSource(reward.imageUrl);
  const showImage = Boolean(imageSource) && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onIncrement}
    >
      <View style={styles.imageContainer}>
        {showImage && imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.iconCircle}>
              <HugeiconsIcon icon={Image01Icon} size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.placeholderText}>Kein Bild verfügbar</Text>
          </View>
        )}

        {isAdmin && onDelete && (
          <TouchableOpacity
            style={styles.floatingAdminBtn}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <HugeiconsIcon icon={Delete02Icon} size={18} color={colors.danger} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.infoCol}>
          <Text style={styles.partnerText} numberOfLines={1}>
            {reward.partnerName}
          </Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {reward.title}
          </Text>
        </View>

        <View style={styles.costBadge}>
          <Text style={styles.costText}>{reward.cost} ReCoins</Text>
        </View>

        <View style={styles.actionCol}>
          {quantity > 0 && (
            <>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onDecrement();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.circleBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.circleBtn,
              !canIncrement && styles.circleBtnDisabled,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onIncrement();
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.circleBtnText,
                !canIncrement && { color: colors.textMuted },
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBF0ED',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  floatingAdminBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1.3,
    marginRight: 8,
  },
  partnerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  costBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginRight: 10,
  },
  costText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  circleBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 20,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
});