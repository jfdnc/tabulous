import { MCPClient } from './mcp-client.js';
import { CompletionService } from './completion-service.js';
export declare function createClient(): Promise<{
    client: MCPClient;
    service: CompletionService;
}>;
export declare function createAndConnectClient(): Promise<{
    client: MCPClient;
    service: CompletionService;
}>;
export { MCPClient } from './mcp-client.js';
export { CompletionService } from './completion-service.js';
