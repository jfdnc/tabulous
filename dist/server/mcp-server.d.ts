import { ToolRegistry } from './tool-registry.js';
import { ServerConfig } from '../config/index.js';
export declare class MCPServer {
    private server;
    private toolRegistry;
    private config;
    constructor(config: ServerConfig);
    private setupHandlers;
    private setupMiddleware;
    registerTool(tool: any): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    private generateRequestId;
    getToolRegistry(): ToolRegistry;
}
