/**
 * ARCHITECTURAL LAYER: APPLICATION STATE ROUTER
 * Coordinates system layout views and state contexts without causing execution blocks.
 */
const AppRouter = {
    switchAuthPanel: function(targetPanelId) {
        // Remove tracking classes from all panels
        document.querySelectorAll('.auth-panel-node').forEach(panel => {
            panel.classList.remove('active-panel');
        });
        
        // Target specific nodes to toggle view state matrices
        const chosenPanel = document.getElementById(`panelAuth${targetPanelId.charAt(0).toUpperCase() + targetPanelId.slice(1)}`);
        if (chosenPanel) {
            chosenPanel.classList.add('active-panel');
            chosenPanel.style.display = 'block';
            
            // Sync siblings states
            this.hideAuthSiblings(chosenPanel.id);
        }
    },

    hideAuthSiblings: function(activeId) {
        const panels = ['panelAuthLogin', 'panelAuthCreate', 'panelAuthImport'];
        panels.forEach(id => {
            if (id !== activeId) {
                document.getElementById(id).style.display = 'none';
            }
        });
    },

    switchDashboardTab: function(targetTabPaneId) {
        document.querySelectorAll('.dashboard-pane-view').forEach(pane => pane.classList.remove('active-pane'));
        document.querySelectorAll('.nav-tab-element').forEach(tab => tab.classList.remove('active'));
        
        const targetPane = document.getElementById(`paneDashboard${targetTabPaneId.toUpperCase()}`);
        const targetTab = document.getElementById(`tabLink${targetTabPaneId.toUpperCase()}`);
        
        if (targetPane && targetTab) {
            targetPane.classList.add('active-pane');
            targetTab.classList.add('active');
        }
    },

    transitionGatewayToSystemCore: function(isOnline = false) {
        document.getElementById('viewAuthGateway').classList.remove('active-view');
        document.getElementById('viewSystemDashboard').classList.add('active-view');
        
        const light = document.getElementById('nodeStatusLight');
        if (isOnline) {
            light.classList.remove('processing');
            light.classList.add('online');
        }
    },

    revertToLockscreenGateway: function() {
        document.getElementById('viewSystemDashboard').classList.remove('active-view');
        document.getElementById('viewAuthGateway').classList.add('active-view');
        this.switchAuthPanel('login');
        
        const light = document.getElementById('nodeStatusLight');
        light.classList.remove('online');
        light.classList.add('processing');
    }
};

