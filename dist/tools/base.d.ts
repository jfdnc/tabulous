import { ToolContext, ToolResult, MiddlewareFunction } from '../types/index.js';
export declare abstract class BaseTool {
    protected readonly name: string;
    protected readonly description: string;
    protected readonly middleware: MiddlewareFunction[];
    constructor(name: string, description: string);
    abstract execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    protected abstract validateArgs(args: Record<string, any>): void;
    getName(): string;
    getDescription(): string;
    addMiddleware(middleware: MiddlewareFunction): void;
    run(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    private executeWithMiddleware;
}
export declare abstract class BaseAsyncTool extends BaseTool {
    protected readonly timeout: number;
    constructor(name: string, description: string, timeout?: number);
    protected executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs?: number): Promise<T>;
}
