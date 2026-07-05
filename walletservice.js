// src/wallet/WalletService.js
//
// Core self-custody wallet logic for EfikcoinWallet (EFC on BNB Smart Chain).
//
// SECURITY MODEL:
// - Private keys / mnemonic NEVER touch plain storage (no AsyncStorage, no state
//   that gets logged, no network calls with the key).
// - Keys live only in the OS-level secure enclave via expo-secure-store
//   (iOS Keychain / Android Keystore), which is hardware-backed on most devices.
// - Signing happens on-device using ethers.js — the key is decrypted from
//   SecureStore into memory only for the duration of the sign operation.
//
// IMPORTANT: This is a starting implementation. Before handling real user funds,
// have this reviewed by someone with smart-contract / mobile-security audit
// experience. Wallet software is one of the highest-stakes categories of code —
// a subtle bug here can directly cost people money.

import 'react-native-get-random-values';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';

// ---- Network config (BSC mainnet) ----
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
const EFC_TOKEN_ADDRESS = '0x677Ce9CBa67f7484ea951a12897CE780cFd8fED1';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

const SECURE_STORE_KEY = 'efikcoin_wallet_mnemonic_v1';

// SecureStore has a ~2KB value limit on some platforms, mnemonics are tiny so this is fine.
const secureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export function getProvider() {
  return new ethers.providers.JsonRpcProvider(BSC_RPC_URL);
}

/**
 * Generates a brand new wallet with a fresh 12-word mnemonic.
 * Does NOT save it — caller must show the seed phrase to the user for
 * backup and get explicit confirmation before calling saveWallet().
 */
export function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    mnemonic: wallet.mnemonic.phrase,
  };
}

/**
 * Validates and derives a wallet from a user-provided mnemonic (import flow).
 * Throws if the phrase is invalid.
 */
export function walletFromMnemonic(mnemonic) {
  const cleaned = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  const wallet = ethers.Wallet.fromMnemonic(cleaned);
  return {
    address: wallet.address,
    mnemonic: cleaned,
  };
}

/**
 * Persists the mnemonic into the device's secure hardware storage.
 * Call this ONLY after the user has confirmed they've backed up their seed phrase.
 */
export async function saveWallet(mnemonic) {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, mnemonic, secureStoreOptions);
}

export async function hasWallet() {
  const existing = await SecureStore.getItemAsync(SECURE_STORE_KEY, secureStoreOptions);
  return existing !== null;
}

/**
 * Loads the wallet from secure storage and returns a signer connected to BSC.
 * Returns null if no wallet exists yet.
 */
export async function loadSigner() {
  const mnemonic = await SecureStore.getItemAsync(SECURE_STORE_KEY, secureStoreOptions);
  if (!mnemonic) return null;
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  return wallet.connect(getProvider());
}

export async function getAddress() {
  const mnemonic = await SecureStore.getItemAsync(SECURE_STORE_KEY, secureStoreOptions);
  if (!mnemonic) return null;
  return ethers.Wallet.fromMnemonic(mnemonic).address;
}

/**
 * Deletes the wallet from this device. IRREVERSIBLE unless the user has
 * their seed phrase written down elsewhere. Always confirm with the user
 * before calling this.
 */
export async function deleteWallet() {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY, secureStoreOptions);
}

// ---- Balances ----

export async function getBnbBalance(address) {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

export async function getEfcBalance(address) {
  const provider = getProvider();
  const token = new ethers.Contract(EFC_TOKEN_ADDRESS, ERC20_ABI, provider);
  const [raw, decimals] = await Promise.all([
    token.balanceOf(address),
    token.decimals(),
  ]);
  return ethers.utils.formatUnits(raw, decimals);
}

// ---- Sending ----

/**
 * Sends EFC tokens. Returns the transaction hash once submitted.
 * amount is a human-readable string, e.g. "10.5"
 */
export async function sendEfc(toAddress, amount) {
  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('Invalid recipient address');
  }
  const signer = await loadSigner();
  if (!signer) throw new Error('No wallet loaded');

  const token = new ethers.Contract(EFC_TOKEN_ADDRESS, ERC20_ABI, signer);
  const decimals = await token.decimals();
  const value = ethers.utils.parseUnits(amount, decimals);

  const tx = await token.transfer(toAddress, value);
  return tx.hash; // caller can show this immediately, then await tx.wait() separately if needed
}

/**
 * Sends native BNB (needed for gas, or as a direct transfer).
 */
export async function sendBnb(toAddress, amount) {
  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error('Invalid recipient address');
  }
  const signer = await loadSigner();
  if (!signer) throw new Error('No wallet loaded');

  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.utils.parseEther(amount),
  });
  return tx.hash;
}

