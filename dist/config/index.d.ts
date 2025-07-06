import { z } from 'zod';
declare const ServerConfigSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    host: z.ZodDefault<z.ZodString>;
    port: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
    maxConnections: z.ZodDefault<z.ZodNumber>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    middleware: z.ZodDefault<z.ZodObject<{
        rateLimit: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            maxRequests: z.ZodDefault<z.ZodNumber>;
            windowMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            maxRequests: number;
            windowMs: number;
        }, {
            enabled?: boolean | undefined;
            maxRequests?: number | undefined;
            windowMs?: number | undefined;
        }>;
        cache: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            ttlMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            ttlMs: number;
        }, {
            enabled?: boolean | undefined;
            ttlMs?: number | undefined;
        }>;
        timeout: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            timeoutMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            timeoutMs: number;
        }, {
            enabled?: boolean | undefined;
            timeoutMs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        timeout: {
            enabled: boolean;
            timeoutMs: number;
        };
        rateLimit: {
            enabled: boolean;
            maxRequests: number;
            windowMs: number;
        };
        cache: {
            enabled: boolean;
            ttlMs: number;
        };
    }, {
        timeout: {
            enabled?: boolean | undefined;
            timeoutMs?: number | undefined;
        };
        rateLimit: {
            enabled?: boolean | undefined;
            maxRequests?: number | undefined;
            windowMs?: number | undefined;
        };
        cache: {
            enabled?: boolean | undefined;
            ttlMs?: number | undefined;
        };
    }>>;
    tools: z.ZodDefault<z.ZodObject<{
        helpExtractor: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            timeout: z.ZodDefault<z.ZodNumber>;
            helpFlags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            timeout: number;
            enabled: boolean;
            helpFlags: string[];
        }, {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            helpFlags?: string[] | undefined;
        }>;
        manPageParser: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            timeout: z.ZodDefault<z.ZodNumber>;
            sections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            timeout: number;
            enabled: boolean;
            sections: string[];
        }, {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            sections?: string[] | undefined;
        }>;
        completionGenerator: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            supportedShells: z.ZodDefault<z.ZodArray<z.ZodEnum<["bash", "zsh", "fish"]>, "many">>;
            enableAdvancedFeatures: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            supportedShells: ("bash" | "zsh" | "fish")[];
            enableAdvancedFeatures: boolean;
        }, {
            enabled?: boolean | undefined;
            supportedShells?: ("bash" | "zsh" | "fish")[] | undefined;
            enableAdvancedFeatures?: boolean | undefined;
        }>;
        commandAnalyzer: z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
        }, {
            enabled?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        helpExtractor: {
            timeout: number;
            enabled: boolean;
            helpFlags: string[];
        };
        manPageParser: {
            timeout: number;
            enabled: boolean;
            sections: string[];
        };
        completionGenerator: {
            enabled: boolean;
            supportedShells: ("bash" | "zsh" | "fish")[];
            enableAdvancedFeatures: boolean;
        };
        commandAnalyzer: {
            enabled: boolean;
        };
    }, {
        helpExtractor: {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            helpFlags?: string[] | undefined;
        };
        manPageParser: {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            sections?: string[] | undefined;
        };
        completionGenerator: {
            enabled?: boolean | undefined;
            supportedShells?: ("bash" | "zsh" | "fish")[] | undefined;
            enableAdvancedFeatures?: boolean | undefined;
        };
        commandAnalyzer: {
            enabled?: boolean | undefined;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    host: string;
    port: number;
    timeout: number;
    maxConnections: number;
    logLevel: "debug" | "info" | "warn" | "error";
    middleware: {
        timeout: {
            enabled: boolean;
            timeoutMs: number;
        };
        rateLimit: {
            enabled: boolean;
            maxRequests: number;
            windowMs: number;
        };
        cache: {
            enabled: boolean;
            ttlMs: number;
        };
    };
    tools: {
        helpExtractor: {
            timeout: number;
            enabled: boolean;
            helpFlags: string[];
        };
        manPageParser: {
            timeout: number;
            enabled: boolean;
            sections: string[];
        };
        completionGenerator: {
            enabled: boolean;
            supportedShells: ("bash" | "zsh" | "fish")[];
            enableAdvancedFeatures: boolean;
        };
        commandAnalyzer: {
            enabled: boolean;
        };
    };
}, {
    name?: string | undefined;
    version?: string | undefined;
    host?: string | undefined;
    port?: number | undefined;
    timeout?: number | undefined;
    maxConnections?: number | undefined;
    logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    middleware?: {
        timeout: {
            enabled?: boolean | undefined;
            timeoutMs?: number | undefined;
        };
        rateLimit: {
            enabled?: boolean | undefined;
            maxRequests?: number | undefined;
            windowMs?: number | undefined;
        };
        cache: {
            enabled?: boolean | undefined;
            ttlMs?: number | undefined;
        };
    } | undefined;
    tools?: {
        helpExtractor: {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            helpFlags?: string[] | undefined;
        };
        manPageParser: {
            timeout?: number | undefined;
            enabled?: boolean | undefined;
            sections?: string[] | undefined;
        };
        completionGenerator: {
            enabled?: boolean | undefined;
            supportedShells?: ("bash" | "zsh" | "fish")[] | undefined;
            enableAdvancedFeatures?: boolean | undefined;
        };
        commandAnalyzer: {
            enabled?: boolean | undefined;
        };
    } | undefined;
}>;
declare const ClientConfigSchema: z.ZodObject<{
    serverUrl: z.ZodDefault<z.ZodString>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
    retryDelay: z.ZodDefault<z.ZodNumber>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    defaultShell: z.ZodDefault<z.ZodEnum<["bash", "zsh", "fish"]>>;
    outputDirectory: z.ZodDefault<z.ZodString>;
    installCompletions: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    logLevel: "debug" | "info" | "warn" | "error";
    serverUrl: string;
    retryAttempts: number;
    retryDelay: number;
    defaultShell: "bash" | "zsh" | "fish";
    outputDirectory: string;
    installCompletions: boolean;
}, {
    timeout?: number | undefined;
    logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    serverUrl?: string | undefined;
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
    defaultShell?: "bash" | "zsh" | "fish" | undefined;
    outputDirectory?: string | undefined;
    installCompletions?: boolean | undefined;
}>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export declare class ConfigManager {
    private serverConfig;
    private clientConfig;
    loadServerConfig(config?: Partial<ServerConfig>): ServerConfig;
    loadClientConfig(config?: Partial<ClientConfig>): ClientConfig;
    getServerConfig(): ServerConfig;
    getClientConfig(): ClientConfig;
    private loadServerConfigFromEnv;
    private loadClientConfigFromEnv;
}
export declare const configManager: ConfigManager;
export {};
