const API_URL = 'http://localhost:8080';
const AUTH_BASE_URL = `${API_URL}/api/auth`;
const USERS_URL = `${API_URL}/api/users`;
const TRANSACTIONS_URL = `${API_URL}/api/transactions`;
const REWARDS_URL = `${API_URL}/api/rewards`;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Bypass-Tunnel-Reminder': 'true', 
};

export interface BackendTransaction {
  id: number;
  amount: number;
  unitId: string;
  value: number;
  timeStamp: string;
}

export interface UpdateUserData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Reward {
  id: string;
  title: string;
  partnerName: string;
  cost: number;
  description?: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  publicId: string;
  balance: number;
  role: 'USER' | 'ADMIN';
}

// Auth

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    throw new Error('Fehler bei der Registrierung');
  }

  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Fehler bei dem Login bitte überprüf die Daten.');
  }

  return response.json();
};

// Main Functions

export const fetchTotalQuantity = async (userId: string): Promise<number> => {
  const response = await fetch(`${TRANSACTIONS_URL}/user/${userId}/quantity`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error('Fehler beim Aufruf der Menge');
  }

  return response.json();
};

export const fetchUserBalance = async (userId: string): Promise<number> => {
  const response = await fetch(`${TRANSACTIONS_URL}/user/${userId}/balance`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error('Fehler beim Aufruf des Geldbetrags');
  }

  return response.json();
};

export const getUserData = async (userId: string) => {
  try {
    const response = await fetch(`${USERS_URL}/${userId}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Nutzerdaten');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getUserData:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: UpdateUserData) => {
  try {
    const response = await fetch(`${USERS_URL}/${userId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Fehler beim Aktualisieren der Nutzerdaten');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const deleteAccount = async (userId: string) => {
  try {
    const response = await fetch(`${USERS_URL}/${userId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Kontos (Status: ${response.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    throw error;
  }
};

export const fetchUserTransactions = async (
  userId: string
): Promise<BackendTransaction[]> => {
  const response = await fetch(`${TRANSACTIONS_URL}/user/${userId}`, {
    method: 'GET',
    headers: defaultHeaders, // Fehlte vorher komplett
  });

  if (!response.ok) {
    throw new Error('Fehler beim Laden der Transaktionen');
  }

  return await response.json();
};

export async function redeemReward(userId: string, rewardTitle: string, cost: number): Promise<BackendTransaction> {
  const response = await fetch(`${REWARDS_URL}/redeem`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ userId, rewardTitle, cost }),
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || 'Fehler beim Einlösen der Prämie');
  }

  return response.json();
}

export async function fetchRewards(): Promise<Reward[]> {
  const response = await fetch(`${REWARDS_URL}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error('Fehler beim Laden der Prämien');
  }
  return response.json();
}

export async function createReward(payload: {
  adminUserId: string;
  title: string;
  partnerName: string;
  cost: number;
  description?: string;
}): Promise<Reward> {
  const response = await fetch(`${REWARDS_URL}`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Fehler beim Anlegen der Prämie');
  }

  return response.json();
}

export async function deleteReward(rewardId: string, adminUserId: string): Promise<void> {
  const response = await fetch(`${REWARDS_URL}/${rewardId}?adminUserId=${adminUserId}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Fehler beim Löschen der Prämie');
  }
}