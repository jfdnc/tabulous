import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ClientConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ConnectionError, TimeoutError } from '../errors/index.js';
import { ToolResult } from '../types/index.js';

export interface MCPClientOptions {
  serverCommand?: string;
  serverArgs?: string[];
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class MCPClient {
  private client: Client;
  private config: ClientConfig;
  private options: MCPClientOptions;
  private connected: boolean = false;
  private transport: StdioClientTransport | null = null;

  constructor(config: ClientConfig, options: MCPClientOptions = {}) {
    this.config = config;
    this.options = {
      serverCommand: 'node',
      serverArgs: ['dist/index.js'],
      timeout: config.timeout,
      retryAttempts: config.retryAttempts,
      retryDelay: config.retryDelay,
      ...options
    };

    this.client = new Client({
      name: 'tabulous-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      logger.info('Connecting to MCP server', {
        metadata: {
          command: this.options.serverCommand,
          args: this.options.serverArgs
        }
      });

      this.transport = new StdioClientTransport({
        command: this.options.serverCommand!,
        args: this.options.serverArgs || []
      });

      await this.client.connect(this.transport);
      this.connected = true;
      
      logger.info('Connected to MCP server');
    } catch (error) {
      logger.error('Failed to connect to MCP server', error as Error);
      throw new ConnectionError(
        `Failed to connect to MCP server: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client.close();
      this.connected = false;
      this.transport = null;
      
      logger.info('Disconnected from MCP server');
    } catch (error) {
      logger.error('Error disconnecting from MCP server', error as Error);
      throw new ConnectionError(
        `Error disconnecting from MCP server: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  async listTools(): Promise<Array<{ name: string; description: string }>> {
    this.ensureConnected();

    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.listTools();
      });

      return response.tools.map(tool => ({
        name: tool.name,
        description: tool.description || ''
      }));
    } catch (error) {
      logger.error('Failed to list tools', error as Error);
      throw new ConnectionError(
        `Failed to list tools: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  async callTool(name: string, args: Record<string, any> = {}): Promise<ToolResult> {
    this.ensureConnected();

    try {
      const response = await this.executeWithRetry(async () => {
        return await this.client.callTool({
          name,
          arguments: args
        });
      });

      if (response.isError) {
        return {
          success: false,
          error: response.content[0]?.text || 'Unknown error occurred'
        };
      }

      const resultText = response.content[0]?.text || '';
      
      try {
        const data = JSON.parse(resultText);
        return {
          success: true,
          data
        };
      } catch {
        return {
          success: true,
          data: resultText
        };
      }
    } catch (error) {
      logger.error(`Failed to call tool: ${name}`, error as Error, {
        metadata: { args }
      });
      
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.retryAttempts!; attempt++) {
      try {
        return await this.executeWithTimeout(operation);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.options.retryAttempts) {
          break;
        }
        
        logger.warn(`Attempt ${attempt} failed, retrying in ${this.options.retryDelay}ms`, {
          metadata: { error: lastError.message }
        });
        
        await this.delay(this.options.retryDelay!);
      }
    }
    
    throw lastError;
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new ConnectionError('Not connected to MCP server. Call connect() first.');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}