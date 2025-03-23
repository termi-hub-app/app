const DiscordRPC = require('discord-rpc');

// Create a singleton instance
let rpcInstance = null;

class RPCManager {
    constructor() {
        if (rpcInstance) return rpcInstance;
        
        this.clientId = '1350560641353519134';
        this.startTimestamp = Date.now();
        this.rpc = new DiscordRPC.Client({ transport: 'ipc' });
        
        this.rpc.on('ready', () => {
            console.log('Discord RPC ready!');
        });

        rpcInstance = this;
    }

    async initialize(version) {
        try {
            await this.rpc.login({ clientId: this.clientId });
            await this.updatePresence(true, version);
            return true;
        } catch (error) {
            console.error('RPC Init Error:', error);
            return false;
        }
    }

    async updatePresence(isActive, version) {
        if (!this.rpc) return;

        try {
            await this.rpc.setActivity({
                state: isActive ? 'Active on terminal' : 'Away from terminal',
                details: `Version ${version}`,
                startTimestamp: this.startTimestamp,
                largeImageKey: 'logo2',
                largeImageText: 'TermiHub',
                smallImageKey: isActive ? 'active' : 'idle',
                smallImageText: isActive ? 'Active' : 'Idle',
                instance: false
            });
        } catch (error) {
            console.error('RPC Update Error:', error);
        }
    }

    destroy() {
        if (this.rpc) {
            this.rpc.destroy().catch(console.error);
            this.rpc = null;
        }
        rpcInstance = null;
    }
}

module.exports = RPCManager;
