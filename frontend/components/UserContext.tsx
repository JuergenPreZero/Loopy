import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getUserData, 
  fetchUserBalance, 
  fetchTotalQuantity, 
  UserProfile 
} from '../api';

interface UserContextType {
  user: UserProfile | null;
  balance: number;
  totalQuantity: number;
  isInitialLoading: boolean;
  refreshData: () => Promise<void>;
  deductBalanceOptimistic: (cost: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const syncData = useCallback(async (isFirstLoad = false) => {
    if (isFirstLoad) setIsInitialLoading(true);

    try {
      const [profileData, balanceData, qtyData] = await Promise.all([
        getUserData(),
        fetchUserBalance(),
        fetchTotalQuantity(),
      ]);

      setUser(profileData);
      setBalance(balanceData);
      setTotalQuantity(qtyData);
    } catch (err) {
      console.warn('Synchronisation fehlgeschlagen:', err);
    } finally {
      if (isFirstLoad) setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData(true);
  }, [syncData]);

  const refreshData = async () => {
    await syncData(false);
  };

  const deductBalanceOptimistic = (cost: number) => {
    setBalance((prev) => Math.max(0, prev - cost));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        totalQuantity,
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