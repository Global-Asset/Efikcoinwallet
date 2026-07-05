/**
 * ARCHITECTURAL LAYER: CLIENT CRYPTOGRAPHIC STORAGE SECURE VAULT
 * Isolates private-key logic in browser memory to preserve strict self-custody rules.
 */
const WalletVault = {
    _runtimeKeySecret: null,

    loginWithSecretKeyphrase: async function() {
        const inputKey = document.getElementById('inputPrivateKey').value.trim();
        if (!inputKey) return alert("System Notification: Input string cannot be blank.");

        try {
            const status = await BlockchainEngine.instantiateSessionNode(inputKey);
            if (status) {
                this._runtimeKeySecret = inputKey;
                AppRouter.transitionGatewayToSystemCore(true);
            }
        } catch (error) {
            alert("Security Registry Rejection: Invalid key parsing sequence.");
        }
    },

    generateFreshMnemonicKeyPair: function() {
        const hexChars = '0123456789abcdef';
        let generatedPrivateKey = "0x", generatedAddress = "0x677";
        
        // Generate pseudo-random private key matching EVM hexadecimal profiles
        for (let i = 0; i < 64; i++) generatedPrivateKey += hexChars[Math.floor(Math.random() * 16)];
        for (let i = 0; i < 37; i++) generatedAddress += hexChars[Math.floor(Math.random() * 16)];

        document.getElementById('generatedPublicAddressField').innerText = generatedAddress;
        document.getElementById('generatedPrivateKeyField').innerText = generatedPrivateKey;
        document.getElementById('keypairGenerationOutputFrame').classList.remove('hidden-initially');
    },

    processExternalImportRoute: function() {
        const key = document.getElementById('inputImportKeyString').value.trim();
        if (!key.startsWith("0x") || key.length < 30) {
            return alert("Formatting Error: Private key must use a valid Hex format.");
        }
        document.getElementById('inputPrivateKey').value = key;
        this.loginWithSecretKeyphrase();
    },

    fetchActiveKeyNode: function() {
        return this._runtimeKeySecret;
    },

    terminateActiveSession: function() {
        this._runtimeKeySecret = null;
        document.getElementById('inputPrivateKey').value = "";
        document.getElementById('inputImportKeyString').value = "";
        document.getElementById('addressDisplayBox').innerText = "SESSION LOCKED";
        BlockchainEngine.wipeSignerContext();
        AppRouter.revertToLockscreenGateway();
    }
};

