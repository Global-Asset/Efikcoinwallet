export default {
  expo: {
    name: "EfikcoinWallet",
    slug: "efikcoin-wallet-efc",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "efikcoinwallet",
    ios: {
      bundleIdentifier: "com.efikcoin.wallet",
      buildNumber: "1.0.0"
    },
    android: {
      package: "com.efikcoin.wallet",
      versionCode: 1
    },
    extra: {
      eas: {
        projectId: "89b205bc-775a-45e5-9f32-591ad3ced271"
      }
    }
  }
};
