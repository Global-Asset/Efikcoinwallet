import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { ethers } from 'ethers';

const EFC_ADDRESS = '0xa1dd6c528882dc19eccbc967f50bbc121a29630e'; // Efikcoin BSC
const BSC_RPC = 'https://bsc-dataseed.binance.org/';
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function transfer(address to, uint amount) returns (bool)'];

export default function HomeScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [efcBalance, setEfcBalance] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    const mnemonic = await SecureStore.getItemAsync('mnemonic');
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);
    const connectedWallet = wallet.connect(provider);
    
    setAddress(wallet.address);
    
    const efcContract = new ethers.Contract(EFC_ADDRESS, ERC20_ABI, provider);
    const [efcRaw, decimals, bnbRaw] = await Promise.all([
      efcContract.balanceOf(wallet.address),
      efcContract.decimals(),
      provider.getBalance(wallet.address)
    ]);
    
    setEfcBalance(ethers.utils.formatUnits(efcRaw, decimals));
    setBnbBalance(ethers.utils.formatEther(bnbRaw));
    setLoading(false);
  };

  const copyAddress = () => {
    Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Wallet address copied');
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#F0B90B" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Address:</Text>
      <Text style={styles.address} onPress={copyAddress}>{address}</Text>
      
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Efikcoin Balance</Text>
        <Text style={styles.balance}>{parseFloat(efcBalance).toFixed(2)} EFC</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>BNB for Gas</Text>
        <Text style={styles.balance}>{parseFloat(bnbBalance).toFixed(4)} BNB</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Send EFC" onPress={() => navigation.navigate('Send')} color="#F0B90B" />
        <Button title="Copy Address" onPress={copyAddress} color="#1E90FF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F', padding: 20, paddingTop: 40 },
  label: { color: '#888', fontSize: 14 },
  address: { color: '#fff', fontSize: 12, marginBottom: 20 },
  card: { backgroundColor: '#1A1A1F', padding: 20, borderRadius: 12, marginBottom: 15 },
  balanceLabel: { color: '#888', fontSize: 14 },
  balance: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }
});
