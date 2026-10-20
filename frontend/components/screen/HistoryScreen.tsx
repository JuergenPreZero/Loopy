import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import TransactionItem from '../TransactionItem';
import { fetchUserTransactions, BackendTransaction } from '../../api'; 

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
        console.error("Fehler beim Abrufen der Transaktionen:", error);
      } finally {
        if (isInitial && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTransactions(true);
    const intervalId = setInterval(() => {
      loadTransactions(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verlauf</Text>
        <Text style={styles.subtitle}>
          Deine bisherigen Abgaben und Pfand-Gutschriften.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
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
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Noch keine Abgaben</Text>
            <Text style={styles.emptySubtitle}>
              Noch nichts abgegeben, mache jetzt den ersten Schritt in eine bessere Zukunft.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 24,
  },
  placeholderContainer: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});