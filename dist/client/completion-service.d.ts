import { MCPClient } from './mcp-client.js';
import { ClientConfig } from '../config/index.js';
import { CompletionConfig, CompletionScript, ShellType } from '../types/index.js';
export declare class CompletionService {
    private client;
    private config;
    constructor(config: ClientConfig, client: MCPClient);
    generateCompletion(completionConfig: CompletionConfig): Promise<CompletionScript>;
    generateCompletionForMultipleShells(targetCommand: string, shells: ShellType[]): Promise<CompletionScript[]>;
    validateShellSupport(shellType: ShellType): Promise<boolean>;
    getAvailableTools(): Promise<Array<{
        name: string;
        description: string;
    }>>;
    testConnection(): Promise<boolean>;
}
