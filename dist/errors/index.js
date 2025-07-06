export class MCPError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = this.constructor.name;
        if (cause) {
            this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
        }
    }
}
export class ValidationError extends MCPError {
    code = 'VALIDATION_ERROR';
    statusCode = 400;
}
export class CommandNotFoundError extends MCPError {
    code = 'COMMAND_NOT_FOUND';
    statusCode = 404;
}
export class CommandExecutionError extends MCPError {
    code = 'COMMAND_EXECUTION_ERROR';
    statusCode = 500;
}
export class CompletionGenerationError extends MCPError {
    code = 'COMPLETION_GENERATION_ERROR';
    statusCode = 500;
}
export class UnsupportedShellError extends MCPError {
    code = 'UNSUPPORTED_SHELL';
    statusCode = 400;
}
export class FileSystemError extends MCPError {
    code = 'FILE_SYSTEM_ERROR';
    statusCode = 500;
}
export class ConfigurationError extends MCPError {
    code = 'CONFIGURATION_ERROR';
    statusCode = 500;
}
export class ConnectionError extends MCPError {
    code = 'CONNECTION_ERROR';
    statusCode = 503;
}
export class TimeoutError extends MCPError {
    code = 'TIMEOUT_ERROR';
    statusCode = 408;
}
export class RateLimitError extends MCPError {
    code = 'RATE_LIMIT_ERROR';
    statusCode = 429;
}
export function isKnownError(error) {
    return error instanceof MCPError;
}
export function createErrorResponse(error) {
    if (isKnownError(error)) {
        return {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
        };
    }
    return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        statusCode: 500,
    };
}
