import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getUserData, 
  fetchUserBalance, 
  fetchTotalQuantity, 
  fetchEarnedCoins,
  UserProfile 
} from '../api';

interface UserContextType {
  user: UserProfile | null;
  balance: number;
  totalQuantity: number;
  earnedCoins: number;
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
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const syncData = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) setIsInitialLoading(true);

    try {
      const [profileData, balanceData, qtyData, coinsData] = await Promise.all([
        getUserData(),
        fetchUserBalance(),
        fetchTotalQuantity(),
        fetchEarnedCoins(),
      ]);

      setUser(profileData);
      setBalance(balanceData);
      setTotalQuantity(qtyData);
      setEarnedCoins(coinsData);
    } catch (err) {
      console.warn('Synchronisation fehlgeschlagen:', err);
    } finally {
      if (isFirstLoad) setIsInitialLoading(false);
    }
  }, []);

  // 1. Initialer Datenabruf beim Start
  useEffect(() => {
    syncData(true);
  }, [syncData]);

  // 2. Automatisches Hintergrund-Polling alle 5 Sekunden (aktualisiert live beim Einwurf)
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