import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ onCreate, onImport }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Efikcoin Wallet</Text>
      <Text style={styles.tagline}>Coin is Life, Life is Coin.</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreate}>
          <Text style={styles.primaryButtonText}>Create New Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onImport}>
          <Text style={styles.secondaryButtonText}>Import Existing Wallet</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        This is a self-custody wallet. Efikcoin cannot recover your funds if you
        lose your seed phrase.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#d4af37',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginBottom: 48,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#d4af37',
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimer: {
    position: 'absolute',
    bottom: 32,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

