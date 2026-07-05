import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';
import * as WalletService from '../wallet/WalletService';

export default function SendScreen({ onBack, onSent }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const isValidAddress = ethers.utils.isAddress(toAddress.trim());
  const isValidAmount = amount.trim() !== '' && Number(amount) > 0;

  function confirmAndSend() {
    Alert.alert(
      'Confirm Send',
      `Send ${amount} EFC to\n${toAddress}?\n\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', style: 'destructive', onPress: doSend },
      ]
    );
  }

  async function doSend() {
    setSending(true);
    try {
      const hash = await WalletService.sendEfc(toAddress.trim(), amount.trim());
      Alert.alert('Transaction Submitted', `Tx hash:\n${hash}`, [
        { text: 'OK', onPress: () => onSent(hash) },
      ]);
    } catch (e) {
      Alert.alert('Send Failed', e.message || 'Unknown error');
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Send EFC</Text>

      <Text style={styles.label}>Recipient Address</Text>
      <TextInput
        style={styles.input}
        value={toAddress}
        onChangeText={setToAddress}
        placeholder="0x..."
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {toAddress.length > 0 && !isValidAddress && (
        <Text style={styles.errorText}>Not a valid address</Text>
      )}

      <Text style={styles.label}>Amount (EFC)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.0"
        placeholderTextColor="#666"
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={[styles.primaryButton, (!isValidAddress || !isValidAmount || sending) && styles.disabled]}
        onPress={confirmAndSend}
        disabled={!isValidAddress || !isValidAmount || sending}
      >
        {sending ? (
          <ActivityIndicator color="#0a0a0a" />
        ) : (
          <Text style={styles.primaryButtonText}>Review & Send</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} disabled={sending}>
        <Text style={styles.cancelText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  heading: { fontSize: 22, fontWeight: '700', color: '#d4af37', marginBottom: 24 },
  label: { color: '#999', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 12,
    padding: 14, color: '#fff', fontSize: 15,
  },
  errorText: { color: '#e05555', fontSize: 12, marginTop: 4 },
  primaryButton: {
    backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32,
  },
  disabled: { opacity: 0.4 },
  primaryButtonText: { color: '#0a0a0a', fontWeight: '700', fontSize: 16 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 16 },
});

