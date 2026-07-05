/**
 * ARCHITECTURAL LAYER: LOCAL ORDER BOOK P2P MATCHING MATRIX
 * Builds, maps, and hooks order advertisements into state registries.
 */
const P2PDesk = {
    registerLocalEscrowOrderAdvertisement: function() {
        const orderType = document.getElementById('selectP2pOrderType').value;
        const rateNGN = document.getElementById('inputP2pFiatRate').value;
        const totalVolume = document.getElementById('inputP2pTokenVolume').value;

        if (!totalVolume || totalVolume <= 0) return alert("Parameters missing for order posting.");

        const tableBody = document.getElementById('p2pOrderBookTableDynamicBody');
        const customTableRowElement = document.createElement('tr');
        
        customTableRowElement.innerHTML = `
            <td>LocalMerchant_Node</td>
            <td><span class="badging ${orderType === 'SELL' ? 'sell-badge' : 'success-badge'}">${orderType}</span></td>
            <td>${parseFloat(totalVolume).toLocaleString()} EFC</td>
            <td>${parseFloat(rateNGN).toLocaleString()} NGN</td>
            <td><button class="btn-table-action" onclick="alert('Opening state connection to local P2P atomic smart contract escrow...')">Trade</button></td>
        `;
        
        tableBody.insertBefore(customTableRowElement, tableBody.firstChild);
        alert(`Order committed to local ledger: Locking ${totalVolume} EFC into P2P routing indexes.`);
        
        document.getElementById('inputP2pTokenVolume').value = "";
    }
};

