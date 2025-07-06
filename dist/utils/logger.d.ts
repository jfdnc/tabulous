export interface LogContext {
    requestId?: string;
    toolName?: string;
    metadata?: Record<string, any>;
}
declare class Logger {
    private logger;
    constructor();
    private formatMessage;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
}
export declare const logger: Logger;
export {};
