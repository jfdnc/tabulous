import { ClientConfig } from '../config/index.js';
import { ToolResult } from '../types/index.js';
export interface MCPClientOptions {
    serverCommand?: string;
    serverArgs?: string[];
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
export declare class MCPClient {
    private client;
    private config;
    private options;
    private connected;
    private transport;
    constructor(config: ClientConfig, options?: MCPClientOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    listTools(): Promise<Array<{
        name: string;
        description: string;
    }>>;
    callTool(name: string, args?: Record<string, any>): Promise<ToolResult>;
    private executeWithRetry;
    private executeWithTimeout;
    private delay;
    private ensureConnected;
    isConnected(): boolean;
}
