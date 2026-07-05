import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView, Alert, Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as WalletService from '../wallet/WalletService';

export default function HomeScreen({ address, onSend }) {
  const [efc, setEfc] = useState('--');
  const [bnb, setBnb] = useState('--');
  const [refreshing, setRefreshing] = useState(false);

  const loadBalances = useCallback(async () => {
    try {
      const [efcBal, bnbBal] = await Promise.all([
        WalletService.getEfcBalance(address),
        WalletService.getBnbBalance(address),
      ]);
      setEfc(Number(efcBal).toFixed(4));
      setBnb(Number(bnbBal).toFixed(5));
    } catch (e) {
      // Network hiccup — keep old values, don't alarm the user on every poll.
      console.warn('Balance fetch failed', e.message);
    }
  }, [address]);

  useEffect(() => {
    loadBalances();
    const interval = setInterval(loadBalances, 20000);
    return () => clearInterval(interval);
  }, [loadBalances]);

  async function onRefresh() {
    setRefreshing(true);
    await loadBalances();
    setRefreshing(false);
  }

  async function copyAddress() {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Address copied to clipboard');
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d4af37" />}
    >
      <Text style={styles.balanceLabel}>EFC Balance</Text>
      <Text style={styles.balanceValue}>{efc}</Text>
      <Text style={styles.gasNote}>{bnb} BNB (for gas)</Text>

      <View style={styles.addressBox}>
        <Text style={styles.addressLabel}>Your Address</Text>
        <Text style={styles.addressValue} numberOfLines={1} ellipsizeMode="middle">
          {address}
        </Text>
        <View style={styles.addressActions}>
          <TouchableOpacity style={styles.smallButton} onPress={copyAddress}>
            <Text style={styles.smallButtonText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => Share.share({ message: address })}
          >
            <Text style={styles.smallButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={onSend}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>

      <Text style={styles.networkNote}>BNB Smart Chain · Mainnet</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  balanceLabel: { color: '#999', fontSize: 14, textAlign: 'center' },
  balanceValue: {
    color: '#d4af37', fontSize: 44, fontWeight: '700', textAlign: 'center', marginVertical: 4,
  },
  gasNote: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 32 },
  addressBox: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#333',
  },
  addressLabel: { color: '#999', fontSize: 12, marginBottom: 6 },
  addressValue: { color: '#fff', fontSize: 14, marginBottom: 12 },
  addressActions: { flexDirection: 'row', gap: 10 },
  smallButton: {
    borderWidth: 1, borderColor: '#d4af37', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
  },
  smallButtonText: { color: '#d4af37', fontWeight: '600', fontSize: 13 },
  sendButton: {
    backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  sendButtonText: { color: '#0a0a0a', fontWeight: '700', fontSize: 16 },
  networkNote: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 20, marginBottom: 40 },
});

