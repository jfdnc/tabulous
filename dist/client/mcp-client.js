import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { logger } from '../utils/logger.js';
import { ConnectionError, TimeoutError } from '../errors/index.js';
export class MCPClient {
    client;
    config;
    options;
    connected = false;
    transport = null;
    constructor(config, options = {}) {
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
    async connect() {
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
                command: this.options.serverCommand,
                args: this.options.serverArgs || []
            });
            await this.client.connect(this.transport);
            this.connected = true;
            logger.info('Connected to MCP server');
        }
        catch (error) {
            logger.error('Failed to connect to MCP server', error);
            throw new ConnectionError(`Failed to connect to MCP server: ${error.message}`, error);
        }
    }
    async disconnect() {
        if (!this.connected) {
            return;
        }
        try {
            await this.client.close();
            this.connected = false;
            this.transport = null;
            logger.info('Disconnected from MCP server');
        }
        catch (error) {
            logger.error('Error disconnecting from MCP server', error);
            throw new ConnectionError(`Error disconnecting from MCP server: ${error.message}`, error);
        }
    }
    async listTools() {
        this.ensureConnected();
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.client.listTools();
            });
            return response.tools.map(tool => ({
                name: tool.name,
                description: tool.description || ''
            }));
        }
        catch (error) {
            logger.error('Failed to list tools', error);
            throw new ConnectionError(`Failed to list tools: ${error.message}`, error);
        }
    }
    async callTool(name, args = {}) {
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
            }
            catch {
                return {
                    success: true,
                    data: resultText
                };
            }
        }
        catch (error) {
            logger.error(`Failed to call tool: ${name}`, error, {
                metadata: { args }
            });
            return {
                success: false,
                error: error.message
            };
        }
    }
    async executeWithRetry(operation) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            try {
                return await this.executeWithTimeout(operation);
            }
            catch (error) {
                lastError = error;
                if (attempt === this.options.retryAttempts) {
                    break;
                }
                logger.warn(`Attempt ${attempt} failed, retrying in ${this.options.retryDelay}ms`, {
                    metadata: { error: lastError.message }
                });
                await this.delay(this.options.retryDelay);
            }
        }
        throw lastError;
    }
    async executeWithTimeout(operation) {
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    ensureConnected() {
        if (!this.connected) {
            throw new ConnectionError('Not connected to MCP server. Call connect() first.');
        }
    }
    isConnected() {
        return this.connected;
    }
}
