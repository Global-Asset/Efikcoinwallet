import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

// Gate app access behind the device's own biometric/passcode lock.
// This does NOT protect the mnemonic itself (SecureStore/Keystore does that) —
// it just stops someone who has your unlocked phone from opening the app
// straight into your balance and send screen.
export default function LockScreen({ onUnlock }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    attemptUnlock();
  }, []);

  async function attemptUnlock() {
    setChecking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // No biometrics/passcode set up on this device — don't block the user,
        // but they should be encouraged to set a device lock for real security.
        onUnlock();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Efikcoin Wallet',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        onUnlock();
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Efikcoin Wallet</Text>
      <Text style={styles.subtitle}>{checking ? 'Authenticating...' : 'Locked'}</Text>
      {!checking && (
        <TouchableOpacity style={styles.button} onPress={attemptUnlock}>
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#d4af37', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#999', fontSize: 14, marginBottom: 24 },
  button: { borderWidth: 1, borderColor: '#d4af37', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { color: '#d4af37', fontWeight: '600' },
});

