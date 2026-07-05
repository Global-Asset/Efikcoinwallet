import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as WalletService from '../wallet/WalletService';

// Three-step flow: 1) show seed phrase  2) confirm they wrote it down
// 3) verify by tapping words in order (catches copy/paste mistakes and
// forces the user to actually look at the phrase once more).
export default function CreateWalletScreen({ onDone, onCancel }) {
  const [step, setStep] = useState(1);
  const [wallet] = useState(() => WalletService.createWallet());
  const words = useMemo(() => wallet.mnemonic.split(' '), [wallet]);

  const [shuffled] = useState(() => shuffleArray(words));
  const [picked, setPicked] = useState([]);

  function pickWord(word, index) {
    if (picked.length >= words.length) return;
    setPicked([...picked, { word, index }]);
  }

  function undoLast() {
    setPicked(picked.slice(0, -1));
  }

  async function finishVerification() {
    const reconstructed = picked.map((p) => p.word).join(' ');
    if (reconstructed !== wallet.mnemonic) {
      Alert.alert('Not quite right', 'Please tap the words in the correct order.');
      setPicked([]);
      return;
    }
    try {
      await WalletService.saveWallet(wallet.mnemonic);
      onDone(wallet.address);
    } catch (e) {
      Alert.alert('Error saving wallet', e.message);
    }
  }

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Your Secret Recovery Phrase</Text>
        <Text style={styles.warning}>
          Write these 12 words down in order and store them somewhere safe. Anyone
          with this phrase can access your funds. Efikcoin cannot recover it for you.
        </Text>

        <View style={styles.seedGrid}>
          {words.map((w, i) => (
            <View key={i} style={styles.seedChip}>
              <Text style={styles.seedIndex}>{i + 1}</Text>
              <Text style={styles.seedWord}>{w}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
          <Text style={styles.primaryButtonText}>I've written it down</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // step 2: verification
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify Your Phrase</Text>
      <Text style={styles.warning}>Tap the words in the correct order.</Text>

      <View style={styles.pickedRow}>
        {picked.map((p, i) => (
          <View key={i} style={styles.pickedChip}>
            <Text style={styles.seedWord}>{p.word}</Text>
          </View>
        ))}
      </View>

      <View style={styles.seedGrid}>
        {shuffled.map((w, i) => (
          <TouchableOpacity
            key={i}
            style={styles.seedChip}
            onPress={() => pickWord(w, i)}
            disabled={picked.length >= words.length}
          >
            <Text style={styles.seedWord}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={undoLast}>
        <Text style={styles.secondaryButtonText}>Undo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, picked.length !== words.length && styles.disabled]}
        onPress={finishVerification}
        disabled={picked.length !== words.length}
      >
        <Text style={styles.primaryButtonText}>Confirm & Create Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  heading: { fontSize: 22, fontWeight: '700', color: '#d4af37', marginBottom: 8 },
  warning: { color: '#aaa', fontSize: 13, marginBottom: 20, lineHeight: 18 },
  seedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pickedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20, minHeight: 40 },
  seedChip: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pickedChip: {
    backgroundColor: '#2a2410',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  seedIndex: { color: '#666', fontSize: 12, marginRight: 6 },
  seedWord: { color: '#fff', fontSize: 14 },
  primaryButton: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  disabled: { opacity: 0.4 },
  primaryButtonText: { color: '#0a0a0a', fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: { color: '#ccc', fontWeight: '600' },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 16 },
});

