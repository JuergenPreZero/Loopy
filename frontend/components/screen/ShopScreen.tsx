import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import RewardCard from '../RewardCard';
import {
  redeemCart,
  fetchRewards,
  createReward,
  deleteReward,
  Reward,
} from '../../api';
import { useUser } from '../UserContext';

const LOCAL_COLORS = {
  primary: '#2563EB',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  successText: '#166534',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#991B1B',
};

const MAX_PER_ITEM = 5;
const MAX_TOTAL_ITEMS = 10;

export default function ShopScreen() {
  const { user, balance, refreshData, deductBalanceOptimistic } = useUser();
  const userRole = user?.role || 'USER';

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('Alle');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPartner, setNewPartner] = useState('');
  const [newCost, setNewCost] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      const rewardsData = await fetchRewards();
      if (Array.isArray(rewardsData)) setRewards(rewardsData);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const partnerList = useMemo(() => {
    const unique = Array.from(new Set(rewards.map((r) => r.partnerName).filter(Boolean)));
    return ['Alle', ...unique];
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    if (selectedPartner === 'Alle') return rewards;
    return rewards.filter((r) => r.partnerName === selectedPartner);
  }, [rewards, selectedPartner]);

  const cartTotalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotalCost = Object.entries(cart).reduce((total, [id, qty]) => {
    const reward = rewards.find((r) => r.id === id);
    return total + (reward ? reward.cost * qty : 0);
  }, 0);

  const hasEnoughBalance = balance >= cartTotalCost;

  const triggerError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMessage(msg);
    errorTimerRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 3500);
  };

  const addToCart = (id: string) => {
    setSuccessMessage(null);
    const currentQty = cart[id] || 0;

    if (currentQty >= MAX_PER_ITEM) {
      triggerError(`Maximal ${MAX_PER_ITEM} Stück pro Prämie erlaubt.`);
      return;
    }

    if (cartTotalItems >= MAX_TOTAL_ITEMS) {
      triggerError(`Dein Warenkorb darf maximal ${MAX_TOTAL_ITEMS} Artikel enthalten.`);
      return;
    }

    setErrorMessage(null);
    setCart((prev) => ({ ...prev, [id]: currentQty + 1 }));
  };

  const removeFromCart = (id: string) => {
    setErrorMessage(null);
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const handleCheckout = async () => {
    if (isCheckingOut || cartTotalItems === 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!hasEnoughBalance) {
      triggerError('Nicht genügend ReCoins für diese Einlösung vorhanden.');
      return;
    }

    setIsCheckingOut(true);

    try {
      const items = Object.entries(cart).map(([rewardId, quantity]) => ({
        rewardId,
        quantity,
      }));

      await redeemCart(items);
      deductBalanceOptimistic?.(cartTotalCost);
      setCart({});
      setSuccessMessage('Prämien erfolgreich eingelöst!');
      setTimeout(() => setSuccessMessage(null), 4000);
      await refreshData();
    } catch (error: any) {
      triggerError(error.message || 'Fehler beim Einlösen der Prämien.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (deletingId) return;

    try {
      setDeletingId(rewardId);
      await deleteReward(rewardId);
      setRewards((prev) => prev.filter((r) => r.id !== rewardId));

      setCart((prev) => {
        const newCart = { ...prev };
        delete newCart[rewardId];
        return newCart;
      });
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateReward = async () => {
    if (!newTitle.trim() || !newPartner.trim() || !newCost.trim()) return;

    try {
      setIsCreating(true);
      await createReward({
        title: newTitle.trim(),
        partnerName: newPartner.trim(),
        cost: parseInt(newCost, 10),
      });

      setNewTitle('');
      setNewPartner('');
      setNewCost('');
      setModalVisible(false);
      await loadData();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={LOCAL_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Prämien & Partner</Text>
      <Text style={styles.subtitle}>Löse deine ReCoins gegen Gutscheine und Prämien ein.</Text>

      {errorMessage && (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>✕ {errorMessage}</Text>
        </View>
      )}

      {successMessage && (
        <View style={styles.bannerSuccess}>
          <Text style={styles.bannerSuccessText}>✓ {successMessage}</Text>
        </View>
      )}

      {userRole === 'ADMIN' && (
        <TouchableOpacity
          style={[styles.button, styles.addBtn]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>+ Prämie hinzufügen</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {partnerList.map((partner) => {
            const isSelected = selectedPartner === partner;
            return (
              <TouchableOpacity
                key={partner}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? LOCAL_COLORS.primary : LOCAL_COLORS.surface,
                    borderColor: isSelected ? LOCAL_COLORS.primary : LOCAL_COLORS.border,
                  },
                ]}
                onPress={() => setSelectedPartner(partner)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#FFFFFF' : LOCAL_COLORS.text },
                  ]}
                >
                  {partner}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filteredRewards.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.subtitle}>Keine Artikel für diesen Shop gefunden.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRewards}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: cartTotalItems > 0 ? 100 : 20 }}
          renderItem={({ item }) => {
            const qty = cart[item.id] || 0;
            const canIncrement = qty < MAX_PER_ITEM && cartTotalItems < MAX_TOTAL_ITEMS;

            return (
              <RewardCard
                reward={item}
                quantity={qty}
                onIncrement={() => addToCart(item.id)}
                onDecrement={() => removeFromCart(item.id)}
                canIncrement={canIncrement}
                isAdmin={userRole === 'ADMIN'}
                onDelete={() => handleDeleteReward(item.id)}
                isDeleting={deletingId === item.id}
              />
            );
          }}
        />
      )}

      {cartTotalItems > 0 && (
        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.checkoutTitle}>
              {cartTotalItems} Artikel gewählt
            </Text>
            <Text style={styles.checkoutSubtitle}>
              Gesamt: {cartTotalCost} ReCoins
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, !hasEnoughBalance && styles.checkoutBtnDisabled]}
            onPress={handleCheckout}
            disabled={isCheckingOut || !hasEnoughBalance}
          >
            {isCheckingOut ? (
              <ActivityIndicator size="small" color={LOCAL_COLORS.primary} />
            ) : (
              <Text style={styles.checkoutBtnText}>Einlösen</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Neue Prämie anlegen</Text>
            <Text style={styles.subtitle}>Erstelle ein neues Partner-Angebot</Text>

            <TextInput
              style={styles.input}
              placeholder="Partnername"
              placeholderTextColor={LOCAL_COLORS.textMuted}
              value={newPartner}
              onChangeText={setNewPartner}
            />
            <TextInput
              style={styles.input}
              placeholder="Titel"
              placeholderTextColor={LOCAL_COLORS.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Preis in ReCoins"
              placeholderTextColor={LOCAL_COLORS.textMuted}
              keyboardType="numeric"
              value={newCost}
              onChangeText={setNewCost}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.button, styles.modalCancelBtn]}
                onPress={() => setModalVisible(false)}
                disabled={isCreating}
              >
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalSaveBtn]}
                onPress={handleCreateReward}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Speichern</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    marginBottom: 12,
  },
  bannerSuccess: {
    backgroundColor: LOCAL_COLORS.successBg,
    borderColor: LOCAL_COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bannerSuccessText: {
    color: LOCAL_COLORS.successText,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerError: {
    backgroundColor: LOCAL_COLORS.errorBg,
    borderColor: LOCAL_COLORS.errorBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bannerErrorText: {
    color: LOCAL_COLORS.errorText,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: LOCAL_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addBtn: {
    marginBottom: 14,
  },
  filterWrapper: {
    marginBottom: 14,
  },
  filterScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: LOCAL_COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutSubtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  checkoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.4,
  },
  checkoutBtnText: {
    color: LOCAL_COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
  },
  input: {
    backgroundColor: LOCAL_COLORS.bg,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: LOCAL_COLORS.text,
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.textMuted,
    marginRight: 8,
  },
  modalSaveBtn: {
    flex: 1,
  },
});