export declare abstract class MCPError extends Error {
    readonly cause?: Error | undefined;
    abstract readonly code: string;
    abstract readonly statusCode: number;
    constructor(message: string, cause?: Error | undefined);
}
export declare class ValidationError extends MCPError {
    readonly code = "VALIDATION_ERROR";
    readonly statusCode = 400;
}
export declare class CommandNotFoundError extends MCPError {
    readonly code = "COMMAND_NOT_FOUND";
    readonly statusCode = 404;
}
export declare class CommandExecutionError extends MCPError {
    readonly code = "COMMAND_EXECUTION_ERROR";
    readonly statusCode = 500;
}
export declare class CompletionGenerationError extends MCPError {
    readonly code = "COMPLETION_GENERATION_ERROR";
    readonly statusCode = 500;
}
export declare class UnsupportedShellError extends MCPError {
    readonly code = "UNSUPPORTED_SHELL";
    readonly statusCode = 400;
}
export declare class FileSystemError extends MCPError {
    readonly code = "FILE_SYSTEM_ERROR";
    readonly statusCode = 500;
}
export declare class ConfigurationError extends MCPError {
    readonly code = "CONFIGURATION_ERROR";
    readonly statusCode = 500;
}
export declare class ConnectionError extends MCPError {
    readonly code = "CONNECTION_ERROR";
    readonly statusCode = 503;
}
export declare class TimeoutError extends MCPError {
    readonly code = "TIMEOUT_ERROR";
    readonly statusCode = 408;
}
export declare class RateLimitError extends MCPError {
    readonly code = "RATE_LIMIT_ERROR";
    readonly statusCode = 429;
}
export declare function isKnownError(error: any): error is MCPError;
export declare function createErrorResponse(error: Error): {
    code: string;
    message: string;
    statusCode: number;
};
