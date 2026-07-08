import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';

export default function OnboardingScreen({ navigation }) {
  const createWallet = async () => {
    const wallet = ethers.Wallet.createRandom();
    await SecureStore.setItemAsync('mnemonic', wallet.mnemonic.phrase);
    Alert.alert(
      'SAVE YOUR SEED PHRASE', 
      wallet.mnemonic.phrase + '\n\nWrite this down. Anyone with these 12 words can steal your EFC.',
      [{ text: 'I saved it', onPress: () => restartApp() }]
    );
  };

  const restartApp = () => {
    // Expo will reload and show HomeScreen
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Efikcoin Wallet</Text>
      <Text style={styles.subtitle}>Self-custodial wallet for EFC on BSC</Text>
      <View style={styles.buttonContainer}>
        <Button title="Create New Wallet" onPress={createWallet} color="#F0B90B" />
        <View style={{ height: 15 }} />
        <Button title="Import Existing Wallet" onPress={() => navigation.navigate('Import')} color="#1E90FF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0F', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#F0B90B', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 60, textAlign: 'center' },
  buttonContainer: { width: '100%' }
});
