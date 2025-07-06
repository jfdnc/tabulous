import { BaseTool } from '../tools/base.js';
import { MiddlewareFunction, ToolContext, ToolResult } from '../types/index.js';
export declare class ToolRegistry {
    private tools;
    private globalMiddleware;
    register(tool: BaseTool): void;
    unregister(toolName: string): boolean;
    getTool(toolName: string): BaseTool | undefined;
    getAllTools(): Map<string, BaseTool>;
    getToolNames(): string[];
    addGlobalMiddleware(middleware: MiddlewareFunction): void;
    executeTool(toolName: string, args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    getToolInfo(): Array<{
        name: string;
        description: string;
    }>;
}
