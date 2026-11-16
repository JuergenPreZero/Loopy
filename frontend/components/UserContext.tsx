import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getUserData, 
  fetchUserBalance, 
  fetchTotalQuantity, 
  fetchEarnedCoins,
  fetchTransactions,
  UserProfile,
  Transaction,
} from '../api';

interface UserContextType {
  user: UserProfile | null;
  balance: number;
  totalQuantity: number;
  earnedCoins: number;
  transactions: Transaction[]; 
  isInitialLoading: boolean;
  refreshData: () => Promise<void>;
  deductBalanceOptimistic: (cost: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // <-- Neu
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const syncData = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) setIsInitialLoading(true);

    try {
      const [profileData, balanceData, qtyData, coinsData, txData] = await Promise.all([
        getUserData(),
        fetchUserBalance(),
        fetchTotalQuantity(),
        fetchEarnedCoins(),
        fetchTransactions().catch(() => []), 
      ]);

      setUser(profileData);
      setBalance(balanceData);
      setTotalQuantity(qtyData);
      setEarnedCoins(coinsData);
      if (Array.isArray(txData)) {
        setTransactions(txData);
      }
    } catch (err) {
      console.warn('Synchronisation fehlgeschlagen:', err);
    } finally {
      if (isFirstLoad) setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData(true);
  }, [syncData]);

  useEffect(() => {
    const interval = setInterval(() => {
      syncData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [syncData]);

  const refreshData = useCallback(async () => {
    await syncData(false);
  }, [syncData]);

  const deductBalanceOptimistic = (cost: number) => {
    setBalance((prev) => Math.max(0, prev - cost));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        totalQuantity,
        earnedCoins,
        transactions,
        isInitialLoading,
        refreshData,
        deductBalanceOptimistic,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser muss innerhalb von UserProvider genutzt werden');
  }
  return context;
};