import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import TransactionItem from '../TransactionItem';
import { useUser } from '../UserContext';
import { globalStyles, colors } from '../../theme';

export default function HistoryScreen() {
  const { transactions, isInitialLoading, refreshData } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <View style={globalStyles.screen}>
      <View style={{ marginBottom: 8 }}>
        <Text style={globalStyles.title}>Verlauf</Text>
        <Text style={globalStyles.subtitle}>
          Deine bisherigen Abgaben und Pfand-Gutschriften.
        </Text>
      </View>

      {isInitialLoading && transactions.length === 0 ? (
        <View style={globalStyles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TransactionItem
              itemType={item.unitId}
              amount={item.amount}
              value={item.value}
              date={item.timeStamp || item.createdAt}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <View style={globalStyles.center}>
          <View
            style={[
              globalStyles.card,
              {
                width: '100%',
                alignItems: 'center',
                paddingVertical: 32,
                paddingHorizontal: 20,
              },
            ]}
          >
            <Text style={{ fontSize: 36, marginBottom: 12 }}>♻️</Text>
            <Text style={[globalStyles.title, { fontSize: 18, textAlign: 'center' }]}>
              Noch keine Abgaben
            </Text>
            <Text
              style={[
                globalStyles.subtitle,
                { textAlign: 'center', marginBottom: 0, marginTop: 4 },
              ]}
            >
              Du hast noch kein Leergut abgegeben. Sobald du etwas an der Station einwirfst, erscheint es hier.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}