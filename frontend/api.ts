import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080';
const AUTH_BASE_URL = `${API_URL}/api/auth`;
const USERS_URL = `${API_URL}/api/users`;
const TRANSACTIONS_URL = `${API_URL}/api/transactions`;
const REWARDS_URL = `${API_URL}/api/rewards`;

const TOKEN_STORAGE_KEY = '@loopie_jwt_token';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!authToken) {
    authToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return authToken;
};

const getHeaders = async () => {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Interfaces
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

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

export interface CartItemPayload {
  rewardId: string;
  quantity: number;
}

// --- Auth ---

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) throw new Error('Fehler bei der Registrierung');
  const data: AuthResponse = await response.json();
  setAuthToken(data.token);
  return data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Fehler bei dem Login. Bitte überprüfe deine Daten.');
  const data: AuthResponse = await response.json();
  setAuthToken(data.token);
  return data;
};

// --- Profile & Balances (/me endpoints) ---

export const fetchTotalQuantity = async (): Promise<number> => {
  const headers = await getHeaders();
  const response = await fetch(`${TRANSACTIONS_URL}/me/quantity`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Fehler beim Aufruf der Menge');
  return response.json();
};

export const fetchUserBalance = async (): Promise<number> => {
  const headers = await getHeaders();
  const response = await fetch(`${TRANSACTIONS_URL}/me/balance`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Fehler beim Aufruf des Kontostands');
  return response.json();
};

export const getUserData = async (): Promise<UserProfile> => {
  const headers = await getHeaders();
  const response = await fetch(`${USERS_URL}/me`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Fehler beim Abrufen der Nutzerdaten');
  return response.json();
};

export const updateUserProfile = async (data: UpdateUserData): Promise<UserProfile> => {
  const headers = await getHeaders();
  const response = await fetch(`${USERS_URL}/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Fehler beim Aktualisieren der Nutzerdaten');
  }

  return response.json();
};

export const deleteAccount = async (): Promise<boolean> => {
  const headers = await getHeaders();
  const response = await fetch(`${USERS_URL}/me`, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('Fehler beim Löschen des Kontos');
  return true;
};

export const fetchUserTransactions = async (): Promise<BackendTransaction[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${TRANSACTIONS_URL}/me`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Fehler beim Laden der Transaktionen');
  return response.json();
};

// --- Rewards ---

export async function fetchRewards(): Promise<Reward[]> {
  const headers = await getHeaders();
  const response = await fetch(`${REWARDS_URL}`, { method: 'GET', headers });
  if (!response.ok) throw new Error('Fehler beim Laden der Prämien');
  return response.json();
}

export async function createReward(payload: {
  title: string;
  partnerName: string;
  cost: number;
  description?: string;
}): Promise<Reward> {
  const headers = await getHeaders();
  const response = await fetch(`${REWARDS_URL}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Fehler beim Anlegen der Prämie');
  }

  return response.json();
}

export async function deleteReward(rewardId: string): Promise<void> {
  const headers = await getHeaders();
  const response = await fetch(`${REWARDS_URL}/${rewardId}`, { method: 'DELETE', headers });
  if (!response.ok) throw new Error('Fehler beim Löschen der Prämie');
}

export async function redeemCart(items: CartItemPayload[]): Promise<BackendTransaction> {
  const headers = await getHeaders();
  const response = await fetch(`${REWARDS_URL}/redeem-cart`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || 'Fehler beim Einlösen der Prämien');
  }

  return response.json();
}