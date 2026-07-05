import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import * as WalletService from './src/wallet/WalletService';
import LockScreen from './src/screens/LockScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import HomeScreen from './src/screens/HomeScreen';
import SendScreen from './src/screens/SendScreen';

// Simple state-machine navigation — no react-navigation dependency needed
// for this screen count. Swap in react-navigation later if the app grows.
const SCREENS = {
  LOADING: 'loading',
  LOCKED: 'locked',
  WELCOME: 'welcome',
  CREATE: 'create',
  IMPORT: 'import',
  HOME: 'home',
  SEND: 'send',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LOADING);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    checkExistingWallet();
  }, []);

  async function checkExistingWallet() {
    const exists = await WalletService.hasWallet();
    if (exists) {
      setScreen(SCREENS.LOCKED);
    } else {
      setScreen(SCREENS.WELCOME);
    }
  }

  async function handleUnlock() {
    const addr = await WalletService.getAddress();
    setAddress(addr);
    setScreen(SCREENS.HOME);
  }

  function handleWalletCreated(addr) {
    setAddress(addr);
    setScreen(SCREENS.HOME);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === SCREENS.LOADING && (
        <View style={styles.loading}>
          <ActivityIndicator color="#d4af37" size="large" />
        </View>
      )}

      {screen === SCREENS.LOCKED && <LockScreen onUnlock={handleUnlock} />}

      {screen === SCREENS.WELCOME && (
        <WelcomeScreen
          onCreate={() => setScreen(SCREENS.CREATE)}
          onImport={() => setScreen(SCREENS.IMPORT)}
        />
      )}

      {screen === SCREENS.CREATE && (
        <CreateWalletScreen
          onDone={handleWalletCreated}
          onCancel={() => setScreen(SCREENS.WELCOME)}
        />
      )}

      {screen === SCREENS.IMPORT && (
        <ImportWalletScreen
          onDone={handleWalletCreated}
          onCancel={() => setScreen(SCREENS.WELCOME)}
        />
      )}

      {screen === SCREENS.HOME && address && (
        <HomeScreen address={address} onSend={() => setScreen(SCREENS.SEND)} />
      )}

      {screen === SCREENS.SEND && (
        <SendScreen
          onBack={() => setScreen(SCREENS.HOME)}
          onSent={() => setScreen(SCREENS.HOME)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
