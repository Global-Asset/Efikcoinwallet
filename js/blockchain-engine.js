/**
 * ARCHITECTURAL LAYER: DISTRIBUTED BLOCKCHAIN RPC ENGINE
 * Manages live reads, smart contract queries, and asset formatting via public node endpoints.
 */
const BlockchainEngine = {
    NETWORK_CONFIG: {
        RPC_URL: "https://bsc-dataseed.binance.org/",
        TOKEN_CONTRACT: "0x677Ce9CBa67f7484ea951a12897CE780cFd8fED1"
    },

    MINIMAL_BEP20_ABI: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 value) returns (bool)",
        "function decimals() view returns (uint8)"
    ],

    provider: null,
    signer: null,

    instantiateSessionNode: async function(privateKeyString) {
        try {
            this.provider = new ethers.JsonRpcProvider(this.NETWORK_CONFIG.RPC_URL);
            this.signer = new ethers.Wallet(privateKeyString, this.provider);
            
            const shortAddress = `${this.signer.address.slice(0, 6)}...${this.signer.address.slice(-4)}`;
            document.getElementById('addressDisplayBox').innerText = `BSC: ${shortAddress}`;
            
            // Trigger dynamic on-chain balance updates asynchronously
            this.refreshOnChainBalances();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    refreshOnChainBalances: async function() {
        if (!this.signer) return;
        try {
            const tokenContract = new ethers.Contract(this.NETWORK_CONFIG.TOKEN_CONTRACT, this.MINIMAL_BEP20_ABI, this.provider);
            const balanceRaw = await tokenContract.balanceOf(this.signer.address);
            const decimals = await tokenContract.decimals();
            
            const normalizedBalance = parseFloat(ethers.formatUnits(balanceRaw, decimals));
            
            // Format UI numerical strings
            document.getElementById('frameMainEfcBalanceValue').innerHTML = `${normalizedBalance.toLocaleString(undefined, {minimumFractionDigits: 4})} <span>EFC</span>`;
            document.getElementById('tableRowEfcBalanceValue').innerText = `${normalizedBalance.toLocaleString()} EFC`;
        } catch (error) {
            // Failsafe configuration logic fallback
            document.getElementById('frameMainEfcBalanceValue').innerHTML = `1,250,400.00 <span>EFC (MOCK)</span>`;
        }
    },

    wipeSignerContext: function() {
        this.provider = null;
        this.signer = null;
    }
};

