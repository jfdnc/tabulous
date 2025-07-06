import { BaseTool } from './base.js';
import { ToolContext, ToolResult } from '../types/index.js';
export declare class CompletionGeneratorTool extends BaseTool {
    constructor();
    protected validateArgs(args: Record<string, any>): void;
    execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;
    private parseOptionsFromHelp;
    private generateCompletionScript;
    private generateBashCompletion;
    private generateZshCompletion;
    private generateFishCompletion;
    private generateInstallInstructions;
}
