import { z } from 'zod';
import { ConfigurationError } from '../errors/index.js';
const ServerConfigSchema = z.object({
    name: z.string().default('tabulous-server'),
    version: z.string().default('1.0.0'),
    host: z.string().default('localhost'),
    port: z.number().default(3000),
    timeout: z.number().default(30000),
    maxConnections: z.number().default(100),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    middleware: z.object({
        rateLimit: z.object({
            enabled: z.boolean().default(true),
            maxRequests: z.number().default(100),
            windowMs: z.number().default(60000),
        }),
        cache: z.object({
            enabled: z.boolean().default(true),
            ttlMs: z.number().default(300000),
        }),
        timeout: z.object({
            enabled: z.boolean().default(true),
            timeoutMs: z.number().default(30000),
        }),
    }).default({}),
    tools: z.object({
        helpExtractor: z.object({
            enabled: z.boolean().default(true),
            timeout: z.number().default(10000),
            helpFlags: z.array(z.string()).default(['--help', '-h']),
        }),
        manPageParser: z.object({
            enabled: z.boolean().default(true),
            timeout: z.number().default(10000),
            sections: z.array(z.string()).default(['1', '8']),
        }),
        completionGenerator: z.object({
            enabled: z.boolean().default(true),
            supportedShells: z.array(z.enum(['bash', 'zsh', 'fish'])).default(['bash', 'zsh', 'fish']),
            enableAdvancedFeatures: z.boolean().default(true),
        }),
        commandAnalyzer: z.object({
            enabled: z.boolean().default(true),
        }),
    }).default({}),
});
const ClientConfigSchema = z.object({
    serverUrl: z.string().default('http://localhost:3000'),
    timeout: z.number().default(30000),
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(1000),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    defaultShell: z.enum(['bash', 'zsh', 'fish']).default('bash'),
    outputDirectory: z.string().default('~/.local/share/tabulous'),
    installCompletions: z.boolean().default(false),
});
export class ConfigManager {
    serverConfig = null;
    clientConfig = null;
    loadServerConfig(config = {}) {
        try {
            const envConfig = this.loadServerConfigFromEnv();
            const mergedConfig = { ...envConfig, ...config };
            this.serverConfig = ServerConfigSchema.parse(mergedConfig);
            return this.serverConfig;
        }
        catch (error) {
            throw new ConfigurationError(`Failed to load server configuration: ${error.message}`, error);
        }
    }
    loadClientConfig(config = {}) {
        try {
            const envConfig = this.loadClientConfigFromEnv();
            const mergedConfig = { ...envConfig, ...config };
            this.clientConfig = ClientConfigSchema.parse(mergedConfig);
            return this.clientConfig;
        }
        catch (error) {
            throw new ConfigurationError(`Failed to load client configuration: ${error.message}`, error);
        }
    }
    getServerConfig() {
        if (!this.serverConfig) {
            throw new ConfigurationError('Server configuration not loaded');
        }
        return this.serverConfig;
    }
    getClientConfig() {
        if (!this.clientConfig) {
            throw new ConfigurationError('Client configuration not loaded');
        }
        return this.clientConfig;
    }
    loadServerConfigFromEnv() {
        return {
            name: process.env.TABULOUS_SERVER_NAME,
            version: process.env.TABULOUS_SERVER_VERSION,
            host: process.env.TABULOUS_SERVER_HOST,
            port: process.env.TABULOUS_SERVER_PORT ? parseInt(process.env.TABULOUS_SERVER_PORT) : undefined,
            timeout: process.env.TABULOUS_SERVER_TIMEOUT ? parseInt(process.env.TABULOUS_SERVER_TIMEOUT) : undefined,
            maxConnections: process.env.TABULOUS_MAX_CONNECTIONS ? parseInt(process.env.TABULOUS_MAX_CONNECTIONS) : undefined,
            logLevel: process.env.TABULOUS_LOG_LEVEL,
        };
    }
    loadClientConfigFromEnv() {
        return {
            serverUrl: process.env.TABULOUS_SERVER_URL,
            timeout: process.env.TABULOUS_CLIENT_TIMEOUT ? parseInt(process.env.TABULOUS_CLIENT_TIMEOUT) : undefined,
            retryAttempts: process.env.TABULOUS_RETRY_ATTEMPTS ? parseInt(process.env.TABULOUS_RETRY_ATTEMPTS) : undefined,
            retryDelay: process.env.TABULOUS_RETRY_DELAY ? parseInt(process.env.TABULOUS_RETRY_DELAY) : undefined,
            logLevel: process.env.TABULOUS_LOG_LEVEL,
            defaultShell: process.env.TABULOUS_DEFAULT_SHELL,
            outputDirectory: process.env.TABULOUS_OUTPUT_DIR,
            installCompletions: process.env.TABULOUS_INSTALL_COMPLETIONS === 'true',
        };
    }
}
export const configManager = new ConfigManager();
