import React, { useState, useEffect, useMemo } from 'react';
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
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import {
  redeemCart,
  fetchRewards,
  createReward,
  deleteReward,
  Reward,
} from '../../api';
import { globalStyles, colors } from '../../theme';
import { useUser } from '../UserContext';

export default function ShopScreen() {
  const { user, balance, refreshData } = useUser();
  const userRole = user?.role || 'USER';

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('Alle');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
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
    if (isCheckingOut || !hasEnoughBalance || cartTotalItems === 0) return;
    setIsCheckingOut(true);

    try {
      const items = Object.entries(cart).map(([rewardId, quantity]) => ({
        rewardId,
        quantity,
      }));

      await redeemCart(items);
      setCart({});
      await refreshData();
    } catch (error) {
      console.error('Fehler beim Einlösen:', error);
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

      {userRole === 'ADMIN' && (
        <TouchableOpacity
          style={[globalStyles.button, { marginBottom: 14 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.buttonText}>+ Prämie hinzufügen</Text>
        </TouchableOpacity>
      )}

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
            const isItemDeleting = deletingId === item.id;
            const qty = cart[item.id] || 0;

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[globalStyles.card, globalStyles.row, { alignItems: 'center' }]}
                onPress={() => addToCart(item.id)}
              >
                <View style={globalStyles.iconPlaceholder}>
                  <Text style={{ fontSize: 20 }}>🎁</Text>
                </View>

                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={[globalStyles.subtitle, { marginBottom: 2, fontSize: 12 }]}
                    numberOfLines={1}
                  >
                    {item.partnerName}
                  </Text>
                  <Text
                    style={[globalStyles.title, { fontSize: 16, marginBottom: 4 }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                    {item.cost} ReCoins
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {qty > 0 && (
                    <>
                      <TouchableOpacity
                        style={globalStyles.circleBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                      >
                        <Text style={globalStyles.circleBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={globalStyles.qtyText}>{qty}</Text>
                    </>
                  )}

                  <TouchableOpacity
                    style={globalStyles.circleBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(item.id);
                    }}
                  >
                    <Text style={globalStyles.circleBtnText}>+</Text>
                  </TouchableOpacity>

                  {userRole === 'ADMIN' && (
                    <TouchableOpacity
                      style={{ padding: 8, marginLeft: 12 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteReward(item.id);
                      }}
                      disabled={Boolean(deletingId)}
                    >
                      {isItemDeleting ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <HugeiconsIcon icon={Delete02Icon} size={20} color={colors.danger} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

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