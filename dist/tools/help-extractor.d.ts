import { BaseAsyncTool } from './base.js';
import { ToolContext, ToolResult } from '../types/index.js';
export declare class HelpExtractorTool extends BaseAsyncTool {
    constructor();
    protected validateArgs(args: Record<string, any>): void;
    execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    private extractHelpText;
}
