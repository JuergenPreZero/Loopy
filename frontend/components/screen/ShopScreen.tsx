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
} from 'react-native';
import RewardCard from '../RewardCard';
import {
  redeemCart,
  fetchRewards,
  createReward,
  deleteReward,
  Reward,
} from '../../api';
import { globalStyles, colors } from '../../theme';
import { useUser } from '../UserContext';

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

    // 1. Limit pro Prämie prüfen
    if (currentQty >= MAX_PER_ITEM) {
      triggerError(`Maximal ${MAX_PER_ITEM} Stück pro Prämie erlaubt.`);
      return;
    }

    // 2. Limit für gesamten Warenkorb prüfen
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
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Prämien & Partner</Text>
      <Text style={globalStyles.subtitle}>Löse deine ReCoins gegen Gutscheine und Prämien ein.</Text>

      {/* Rotes Fehler-Banner */}
      {errorMessage && (
        <View style={globalStyles.bannerError}>
          <Text style={globalStyles.bannerErrorText}>✕ {errorMessage}</Text>
        </View>
      )}

      {/* Grünes Erfolgs-Banner */}
      {successMessage && (
        <View style={globalStyles.bannerSuccess}>
          <Text style={globalStyles.bannerSuccessText}>✓ {successMessage}</Text>
        </View>
      )}

      {userRole === 'ADMIN' && (
        <TouchableOpacity
          style={[globalStyles.button, { marginBottom: 14 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.buttonText}>+ Prämie hinzufügen</Text>
        </TouchableOpacity>
      )}

      {/* Partner-Filter */}
      <View style={{ marginBottom: 14 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {partnerList.map((partner) => {
            const isSelected = selectedPartner === partner;
            return (
              <TouchableOpacity
                key={partner}
                style={[
                  globalStyles.card,
                  globalStyles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedPartner(partner)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: isSelected ? '#FFFFFF' : colors.text,
                  }}
                >
                  {partner}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filteredRewards.length === 0 ? (
        <View style={globalStyles.center}>
          <Text style={globalStyles.subtitle}>Keine Artikel für diesen Shop gefunden.</Text>
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

      {/* Checkout-Bar */}
      {cartTotalItems > 0 && (
        <View style={globalStyles.checkoutBar}>
          <View>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
              {cartTotalItems} Artikel gewählt
            </Text>
            <Text style={{ color: '#FFF', fontSize: 14, opacity: 0.9 }}>
              Gesamt: {cartTotalCost} ReCoins
            </Text>
          </View>
          <TouchableOpacity
            style={[globalStyles.checkoutBtn, !hasEnoughBalance && { opacity: 0.4 }]}
            onPress={handleCheckout}
            disabled={isCheckingOut || !hasEnoughBalance}
          >
            {isCheckingOut ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={globalStyles.checkoutBtnText}>Einlösen</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Admin Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={globalStyles.modalBackground}>
          <View style={[globalStyles.card, { width: '100%', maxWidth: 400 }]}>
            <Text style={globalStyles.title}>Neue Prämie anlegen</Text>
            <Text style={globalStyles.subtitle}>Erstelle ein neues Partner-Angebot</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Partnername"
              placeholderTextColor={colors.textMuted}
              value={newPartner}
              onChangeText={setNewPartner}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Titel"
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Preis in ReCoins"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={newCost}
              onChangeText={setNewCost}
            />

            <View style={[globalStyles.row, { marginTop: 8 }]}>
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  { flex: 1, backgroundColor: colors.textMuted, marginRight: 8 },
                ]}
                onPress={() => setModalVisible(false)}
                disabled={isCreating}
              >
                <Text style={globalStyles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1 }]}
                onPress={handleCreateReward}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={globalStyles.buttonText}>Speichern</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}