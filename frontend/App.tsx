import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from './components/Header';
import Navbar from './components/Navbar'; 
import HomeScreen from './components/screen/HomeScreen';
import ProfileScreen from './components/screen/ProfileScreen'; 
import QrScreen from './components/screen/QrScreen';
import LandingScreen from './components/auth/LandingScreen';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import HistoryScreen from './components/screen/HistoryScreen';
import ShopScreen from './components/screen/ShopScreen';
import { UserProvider } from './components/UserContext';
import { setAuthToken } from './api';

const TOKEN_STORAGE_KEY = '@loopie_jwt_token';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPage, setAuthPage] = useState<'landing' | 'login' | 'register'>('landing');
  const [activePage, setActivePage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => { 
    const checkSavedSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
          setAuthToken(savedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedSession();
  }, []);

  const handleLoginSuccess = async (token: string, rememberMe: boolean) => {
    try {
      setAuthToken(token);
      if (rememberMe) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fehler beim Speichern der Session:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthToken(null);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setIsAuthenticated(false);
      setActivePage(1);
      setAuthPage('landing');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {authPage === 'landing' && (
            <LandingScreen 
              onNavigateLogin={() => setAuthPage('login')} 
              onNavigateRegister={() => setAuthPage('register')} 
            />
          )}
          {authPage === 'login' && (
            <LoginScreen 
              onBack={() => setAuthPage('landing')}
              onLoginSuccess={(token, rememberMe) => handleLoginSuccess(token, rememberMe)} 
              onNavigateRegister={() => setAuthPage('register')}
            />
          )}
          {authPage === 'register' && (
            <RegisterScreen 
              onBack={() => setAuthPage('landing')}
              onRegisterSuccess={(token) => handleLoginSuccess(token, true)} 
              onNavigateLogin={() => setAuthPage('login')}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case 1: return <HomeScreen setActivePage={setActivePage} />;
      case 2: return <HistoryScreen />;
      case 3: return <QrScreen />;
      case 4: return <ShopScreen />;
      case 5: return <ProfileScreen onLogout={handleLogout} />;
      default: return <HomeScreen setActivePage={setActivePage} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <UserProvider>
          <Header />
          <View style={styles.content}>
            {renderContent()}
          </View>
          <Navbar activePage={activePage} setActivePage={setActivePage} />
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});