import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as WalletService from '../wallet/WalletService';

export default function ImportWalletScreen({ onDone, onCancel }) {
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);
    try {
      const wallet = WalletService.walletFromMnemonic(phrase);
      await WalletService.saveWallet(wallet.mnemonic);
      onDone(wallet.address);
    } catch (e) {
      Alert.alert('Invalid recovery phrase', 'Please check your 12 or 24-word phrase and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Import Wallet</Text>
      <Text style={styles.warning}>
        Enter your 12 or 24-word recovery phrase, separated by spaces.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="word1 word2 word3 ..."
        placeholderTextColor="#666"
        value={phrase}
        onChangeText={setPhrase}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={false}
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabled]}
        onPress={handleImport}
        disabled={loading || phrase.trim().split(/\s+/).length < 12}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Importing...' : 'Import Wallet'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  heading: { fontSize: 22, fontWeight: '700', color: '#d4af37', marginBottom: 8 },
  warning: { color: '#aaa', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  primaryButtonText: { color: '#0a0a0a', fontWeight: '700', fontSize: 16 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 16 },
});

