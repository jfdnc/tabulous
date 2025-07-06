export abstract class MCPError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

export class ValidationError extends MCPError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class CommandNotFoundError extends MCPError {
  readonly code = 'COMMAND_NOT_FOUND';
  readonly statusCode = 404;
}

export class CommandExecutionError extends MCPError {
  readonly code = 'COMMAND_EXECUTION_ERROR';
  readonly statusCode = 500;
}

export class CompletionGenerationError extends MCPError {
  readonly code = 'COMPLETION_GENERATION_ERROR';
  readonly statusCode = 500;
}

export class UnsupportedShellError extends MCPError {
  readonly code = 'UNSUPPORTED_SHELL';
  readonly statusCode = 400;
}

export class FileSystemError extends MCPError {
  readonly code = 'FILE_SYSTEM_ERROR';
  readonly statusCode = 500;
}

export class ConfigurationError extends MCPError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly statusCode = 500;
}

export class ConnectionError extends MCPError {
  readonly code = 'CONNECTION_ERROR';
  readonly statusCode = 503;
}

export class TimeoutError extends MCPError {
  readonly code = 'TIMEOUT_ERROR';
  readonly statusCode = 408;
}

export class RateLimitError extends MCPError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
}

export function isKnownError(error: any): error is MCPError {
  return error instanceof MCPError;
}

export function createErrorResponse(error: Error): {
  code: string;
  message: string;
  statusCode: number;
} {
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