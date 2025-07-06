import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseTool, BaseAsyncTool } from './base.js';
import { ToolContext, ToolResult, HelpOutput } from '../types/index.js';
import { CommandExecutionError, ValidationError } from '../errors/index.js';
import { z } from 'zod';

const execAsync = promisify(exec);

const HelpExtractorArgsSchema = z.object({
  command: z.string().min(1),
  helpFlags: z.array(z.string()).default(['--help', '-h']),
  timeout: z.number().default(5000),
});

export class HelpExtractorTool extends BaseAsyncTool {
  constructor() {
    super(
      'help-extractor',
      'Extract help text from CLI commands using various help flags',
      10000
    );
  }

  protected validateArgs(args: Record<string, any>): void {
    try {
      HelpExtractorArgsSchema.parse(args);
    } catch (error) {
      throw new ValidationError(`Invalid arguments: ${(error as Error).message}`);
    }
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const { command, helpFlags, timeout } = HelpExtractorArgsSchema.parse(args);

    const results: HelpOutput[] = [];
    
    for (const flag of helpFlags) {
      try {
        const result = await this.executeWithTimeout(
          () => this.extractHelpText(command, flag),
          timeout
        );
        
        results.push(result);
        
        if (result.exitCode === 0 && result.helpText.trim()) {
          break;
        }
      } catch (error) {
        results.push({
          command: `${command} ${flag}`,
          helpText: '',
          exitCode: -1,
          stderr: (error as Error).message
        });
      }
    }

    const bestResult = results.find(r => r.exitCode === 0 && r.helpText.trim()) || results[0];
    
    if (!bestResult || (!bestResult.helpText.trim() && bestResult.exitCode !== 0)) {
      throw new CommandExecutionError(
        `Failed to extract help text for command: ${command}. Tried flags: ${helpFlags.join(', ')}`
      );
    }

    return {
      success: true,
      data: bestResult,
      metadata: {
        triedFlags: helpFlags,
        totalAttempts: results.length
      }
    };
  }

  private async extractHelpText(command: string, flag: string): Promise<HelpOutput> {
    const fullCommand = `${command} ${flag}`;
    
    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      return {
        command: fullCommand,
        helpText: stdout || stderr, // Some commands output help to stderr
        exitCode: 0,
        stderr: stderr
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new CommandExecutionError(`Command not found: ${command}`);
      }
      
      return {
        command: fullCommand,
        helpText: error.stdout || '',
        exitCode: error.code || 1,
        stderr: error.stderr || error.message
      };
    }
  }
}