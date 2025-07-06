import { MCPClient } from './mcp-client.js';
import { CompletionService } from './completion-service.js';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
export async function createClient() {
    const config = configManager.loadClientConfig();
    const client = new MCPClient(config, {
        serverCommand: 'node',
        serverArgs: ['dist/index.js']
    });
    const service = new CompletionService(config, client);
    return { client, service };
}
export async function createAndConnectClient() {
    const { client, service } = await createClient();
    try {
        await client.connect();
        logger.info('Client connected successfully');
        // Test connection
        const isConnected = await service.testConnection();
        if (!isConnected) {
            throw new Error('Connection test failed');
        }
        return { client, service };
    }
    catch (error) {
        logger.error('Failed to connect client', error);
        throw error;
    }
}
export { MCPClient } from './mcp-client.js';
export { CompletionService } from './completion-service.js';
