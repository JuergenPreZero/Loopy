import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import TransactionItem from '../TransactionItem';
import { fetchUserTransactions, BackendTransaction } from '../../api';
import { globalStyles, colors } from '../../theme';

interface HistoryScreenProps {
  userId: string;
}

export default function HistoryScreen({ userId }: HistoryScreenProps) {
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async (isInitial = false) => {
      if (!userId) return;
      if (isInitial) setIsLoading(true);

      try {
        const data = await fetchUserTransactions(userId);
        if (isMounted) {
          setTransactions(data);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Transaktionen:', error);
      } finally {
        if (isInitial && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTransactions(true);
    const intervalId = setInterval(() => {
      loadTransactions(false);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId]);

  return (
    <View style={globalStyles.screen}>
      <View style={{ marginBottom: 8 }}>
        <Text style={globalStyles.title}>Verlauf</Text>
        <Text style={globalStyles.subtitle}>
          Deine bisherigen Abgaben und Pfand-Gutschriften.
        </Text>
      </View>

      {isLoading ? (
        <View style={globalStyles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TransactionItem
              itemType={item.unitId}
              amount={item.amount}
              value={item.value}
              date={item.timeStamp}
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