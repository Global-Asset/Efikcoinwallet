# EfikcoinWallet — Setup Instructions

## 1. Fix your build first

Your original `package.json` was missing `"main": "node_modules/expo/AppEntry.js"`.
This is almost certainly why EAS Build failed at "Resolve build configuration" —
Expo couldn't determine your app's entry point. It's already fixed in the
`package.json` provided here.

Also verify these files actually exist in your repo (missing assets cause the
same failure):
- `./assets/icon.png`
- `./assets/splash.png`
- `./assets/adaptive-icon.png`
- `./assets/favicon.png`

## 2. Install the new dependencies

Copy all files from this delivery into your repo (matching folder structure),
replace your `package.json`, then run:

```bash
npm install
```

## 3. Run it

```bash
npx expo start
```

Scan the QR code with Expo Go, or run on a simulator.

## 4. What this build includes

- **Create wallet**: generates a real BIP-39 seed phrase on-device, walks the
  user through backup + a verification step before saving anything.
- **Import wallet**: paste an existing 12/24-word phrase.
- **Secure storage**: the seed phrase is stored via `expo-secure-store`, which
  uses the iOS Keychain / Android Keystore — hardware-backed encryption, not
  plain storage.
- **App lock**: device biometrics/passcode gate re-opening the app.
- **Home screen**: live EFC and BNB balances from BSC mainnet, polls every 20s.
- **Send**: transfers EFC with address validation and a confirmation dialog.

## 5. Before this touches real funds — please do these

This is a solid foundation, not a finished, audited product. Specifically:

- **Get a second set of eyes** on `WalletService.js` from someone experienced
  in wallet security before real money flows through it.
- **Test extensively on testnet first.** Switch `BSC_RPC_URL` to the BSC
  testnet endpoint and use test tokens until you're confident.
- **Add transaction fee estimation** — right now sends use default gas
  settings; on a congested network that can fail silently or overpay.
- **Consider a backend RPC fallback** — the public `bsc-dataseed.binance.org`
  endpoint can rate-limit under load. Services like Ankr or QuickNode offer
  free-tier dedicated BSC RPC endpoints that are more reliable in production.
- **Add PIN as fallback** for devices without biometrics enrolled — right now
  those devices skip the lock screen entirely.

## 6. Files in this delivery

```
App.js
package.json
src/wallet/WalletService.js       — core key gen, storage, signing, balances
src/screens/WelcomeScreen.js
src/screens/CreateWalletScreen.js
src/screens/ImportWalletScreen.js
src/screens/LockScreen.js
src/screens/HomeScreen.js
src/screens/SendScreen.js
```
