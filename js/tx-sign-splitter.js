/**
 * ARCHITECTURAL LAYER: TRANSACTION DELEGATION SIGNING SPLITTER
 * Implements the required 0.5% gas collection routing back to your custom treasury.
 */
const TxSignSplitter = {
    SETTING_PARAMETERS: {
        TREASURY_VAULT: "0xa1DD6C528882Dc19EcCbC967F50bBC121A29630e",
        SURCHARGE_RATE: 0.005 // 0.5% system processing fee
    },

    initiateOwnerSignedTransactionSplit: async function() {
        if (!BlockchainEngine.signer) return alert("System error: Cryptographic signature entity context missing.");

        const recipient = document.getElementById('inputTxDestinationAddress').value.trim();
        const rawAmount = parseFloat(document.getElementById('inputTxTokenVolume').value || "0");

        if (!ethers.isAddress(recipient)) return alert("Input Validation Error: Recipient is not a valid EVM address.");
        if (rawAmount <= 0) return alert("Input Validation Error: Volume parameter must exceed absolute zero boundaries.");

        const totalCalculatedGasFee = rawAmount * this.SETTING_PARAMETERS.SURCHARGE_RATE;
        const netRecipientValue = rawAmount - totalCalculatedGasFee;

        // Challenge the user with an explicit signature window modal
        const isOwnerSignatureApproved = confirm(
            `🔐 CRYPTOGRAPHIC PAYMENT SIGNATURE CHALLENGE\n\n` +
            `Destination Address: ${recipient}\n` +
            `Net Beneficiary Value: ${netRecipientValue.toFixed(4)} EFC\n` +
            `Ecosystem Gas Reroute: ${totalCalculatedGasFee.toFixed(4)} EFC (Routes to Treasury)\n\n` +
            `Do you authorize your private key signature to sign and broadcast this split transaction payload?`
        );

        if (!isOwnerSignatureApproved) return alert("Transaction Aborted: Owner signature refused.");

        try {
            const tokenContract = new ethers.Contract(
                BlockchainEngine.NETWORK_CONFIG.TOKEN_CONTRACT, 
                BlockchainEngine.MINIMAL_BEP20_ABI, 
                BlockchainEngine.signer
            );
            const decimals = await tokenContract.decimals();

            const atomicRecipientUnits = ethers.parseUnits(netRecipientValue.toFixed(decimals), decimals);
            const atomicTreasuryUnits = ethers.parseUnits(totalCalculatedGasFee.toFixed(decimals), decimals);

            // Step 1: Send the primary token payment payload to the recipient node
            const transactionBlockA = await tokenContract.transfer(recipient, atomicRecipientUnits);
            await transactionBlockA.wait();

            // Step 2: Route the 0.5% gas fee back into your custom treasury address
            const transactionBlockB = await tokenContract.transfer(this.SETTING_PARAMETERS.TREASURY_VAULT, atomicTreasuryUnits);
            await transactionBlockB.wait();

            alert("🎉 Transaction Split Executed Successfully! Gas fee returned to treasury.");
            BlockchainEngine.refreshOnChainBalances();
        } catch (error) {
            alert("Blockchain execution error: " + (error.reason || "Mining transmission failed. Check native gas levels."));
        }
    }
};

