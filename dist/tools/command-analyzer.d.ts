import { BaseTool } from './base.js';
import { ToolContext, ToolResult } from '../types/index.js';
export declare class CommandAnalyzerTool extends BaseTool {
    constructor();
    protected validateArgs(args: Record<string, any>): void;
    execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    private extractSubcommands;
    private extractSubcommandsFromHelp;
    private extractSubcommandsFromMan;
    private extractOptions;
    private extractOptionsFromHelp;
    private extractOptionsFromMan;
}
