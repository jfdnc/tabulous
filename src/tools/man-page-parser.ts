import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseAsyncTool } from './base.js';
import { ToolContext, ToolResult, ManPage } from '../types/index.js';
import { CommandExecutionError, ValidationError } from '../errors/index.js';
import { z } from 'zod';

const execAsync = promisify(exec);

const ManPageParserArgsSchema = z.object({
  command: z.string().min(1),
  sections: z.array(z.string()).default(['1', '8']),
  timeout: z.number().default(5000),
});

export class ManPageParserTool extends BaseAsyncTool {
  constructor() {
    super(
      'man-page-parser',
      'Parse manual pages for CLI commands',
      10000
    );
  }

  protected validateArgs(args: Record<string, any>): void {
    try {
      ManPageParserArgsSchema.parse(args);
    } catch (error) {
      throw new ValidationError(`Invalid arguments: ${(error as Error).message}`);
    }
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const { command, sections, timeout } = ManPageParserArgsSchema.parse(args);

    for (const section of sections) {
      try {
        const manPage = await this.executeWithTimeout(
          () => this.parseManPage(command, section),
          timeout
        );
        
        if (manPage.available) {
          return {
            success: true,
            data: manPage,
            metadata: { section }
          };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      success: true,
      data: {
        command,
        section: '',
        content: '',
        available: false
      } as ManPage,
      metadata: {
        triedSections: sections,
        message: `No manual page found for ${command}`
      }
    };
  }

  private async parseManPage(command: string, section: string): Promise<ManPage> {
    try {
      const { stdout } = await execAsync(`man ${section} ${command}`, {
        timeout: this.timeout,
        maxBuffer: 2 * 1024 * 1024 // 2MB buffer for man pages
      });

      return {
        command,
        section,
        content: stdout,
        available: true
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new CommandExecutionError('man command not found');
      }
      
      return {
        command,
        section,
        content: '',
        available: false
      };
    }
  }
}