import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import TransactionItem from '../TransactionItem';
import { useUser } from '../UserContext';

const LOCAL_COLORS = {
  primary: '#2563EB',
  text: '#0F172A',
  textMuted: '#64748B',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  bg: '#F8FAFC',
};

export default function HistoryScreen() {
  const { transactions, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Verlauf</Text>
        <Text style={styles.subtitle}>
          Deine bisherigen Abgaben und Pfand-Gutschriften.
        </Text>
      </View>

      {isInitialLoading && transactions.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={LOCAL_COLORS.primary} />
        </View>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[LOCAL_COLORS.primary]}
              tintColor={LOCAL_COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TransactionItem
              itemType={item.unitId}
              amount={item.amount}
              weight={item.weight}
              value={item.value}
              date={item.timeStamp || item.createdAt}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.center}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>♻️</Text>
            <Text style={styles.emptyTitle}>Noch keine Abgaben</Text>
            <Text style={styles.emptyText}>
              Du hast noch kein Leergut abgegeben. Sobald du etwas an der Station einwirfst, erscheint es hier.
            </Text>
          </View>
        </View>
      )}
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
  header: {
    marginBottom: 8,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: LOCAL_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.border,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LOCAL_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: LOCAL_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});