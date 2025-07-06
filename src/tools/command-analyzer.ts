import { BaseTool } from './base.js';
import { ToolContext, ToolResult, CommandInfo, HelpOutput, ManPage } from '../types/index.js';
import { ValidationError } from '../errors/index.js';
import { z } from 'zod';

const CommandAnalyzerArgsSchema = z.object({
  helpOutput: z.object({
    command: z.string(),
    helpText: z.string(),
    exitCode: z.number(),
    stderr: z.string(),
  }),
  manPage: z.object({
    command: z.string(),
    section: z.string(),
    content: z.string(),
    available: z.boolean(),
  }),
  version: z.string().optional(),
});

export class CommandAnalyzerTool extends BaseTool {
  constructor() {
    super(
      'command-analyzer',
      'Analyze command documentation to extract structured information'
    );
  }

  protected validateArgs(args: Record<string, any>): void {
    try {
      CommandAnalyzerArgsSchema.parse(args);
    } catch (error) {
      throw new ValidationError(`Invalid arguments: ${(error as Error).message}`);
    }
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const { helpOutput, manPage, version } = CommandAnalyzerArgsSchema.parse(args);

    const commandInfo: CommandInfo = {
      command: helpOutput.command.split(' ')[0], // Extract base command
      helpOutput,
      manPage,
      version,
      subcommands: this.extractSubcommands(helpOutput.helpText, manPage.content),
      options: this.extractOptions(helpOutput.helpText, manPage.content),
    };

    return {
      success: true,
      data: commandInfo,
      metadata: {
        hasManPage: manPage.available,
        optionsCount: commandInfo.options.length,
        subcommandsCount: commandInfo.subcommands.length,
        sources: {
          help: helpOutput.helpText.length > 0,
          manPage: manPage.available,
          version: Boolean(version),
        }
      }
    };
  }

  private extractSubcommands(helpText: string, manContent: string): string[] {
    const subcommands = new Set<string>();
    
    // Extract from help text
    const helpSubcommands = this.extractSubcommandsFromHelp(helpText);
    helpSubcommands.forEach(cmd => subcommands.add(cmd));
    
    // Extract from man page if available
    if (manContent) {
      const manSubcommands = this.extractSubcommandsFromMan(manContent);
      manSubcommands.forEach(cmd => subcommands.add(cmd));
    }
    
    return Array.from(subcommands).sort();
  }

  private extractSubcommandsFromHelp(helpText: string): string[] {
    const subcommands: string[] = [];
    const lines = helpText.split('\n');
    
    let inSubcommandSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      
      // Detect subcommand sections
      if (trimmedLine.includes('subcommand') || 
          trimmedLine.includes('command') || 
          trimmedLine.includes('available commands')) {
        inSubcommandSection = true;
        continue;
      }
      
      // Stop at next major section
      if (inSubcommandSection && (trimmedLine.includes('option') || trimmedLine.includes('flag'))) {
        inSubcommandSection = false;
      }
      
      if (inSubcommandSection) {
        // Extract subcommand names (usually first word on line)
        const match = line.match(/^\s*([a-zA-Z][a-zA-Z0-9-_]*)\s/);
        if (match && match[1].length > 1) {
          subcommands.push(match[1]);
        }
      }
    }
    
    return subcommands;
  }

  private extractSubcommandsFromMan(manContent: string): string[] {
    const subcommands: string[] = [];
    
    // Look for SYNOPSIS section which often lists subcommands
    const synopsisMatch = manContent.match(/SYNOPSIS\s*\n(.*?)(?=\n[A-Z]|\n\s*$)/s);
    if (synopsisMatch) {
      const synopsis = synopsisMatch[1];
      const commandMatches = synopsis.match(/\b[a-zA-Z][a-zA-Z0-9-_]*\b/g);
      if (commandMatches) {
        commandMatches.forEach(cmd => {
          if (cmd.length > 1 && !cmd.match(/^(and|or|the|with|for|to|of|in|on|at)$/i)) {
            subcommands.push(cmd);
          }
        });
      }
    }
    
    return subcommands;
  }

  private extractOptions(helpText: string, manContent: string): Array<{flag: string, description: string, hasValue: boolean}> {
    const options = new Map<string, {flag: string, description: string, hasValue: boolean}>();
    
    // Extract from help text
    const helpOptions = this.extractOptionsFromHelp(helpText);
    helpOptions.forEach(opt => options.set(opt.flag, opt));
    
    // Extract from man page and merge
    if (manContent) {
      const manOptions = this.extractOptionsFromMan(manContent);
      manOptions.forEach(opt => {
        if (!options.has(opt.flag)) {
          options.set(opt.flag, opt);
        }
      });
    }
    
    return Array.from(options.values()).sort((a, b) => {
      // Sort by flag length (short flags first)
      if (a.flag.length !== b.flag.length) {
        return a.flag.length - b.flag.length;
      }
      return a.flag.localeCompare(b.flag);
    });
  }

  private extractOptionsFromHelp(helpText: string): Array<{flag: string, description: string, hasValue: boolean}> {
    const options: Array<{flag: string, description: string, hasValue: boolean}> = [];
    const lines = helpText.split('\n');
    
    for (const line of lines) {
      // Match various option patterns
      const patterns = [
        /^\s*(-[a-zA-Z])\s*,?\s*(--[a-zA-Z][a-zA-Z0-9-]*)\s*(?:[=\s]([A-Z_]+))?\s*(.*)$/,
        /^\s*(--[a-zA-Z][a-zA-Z0-9-]*)\s*(?:[=\s]([A-Z_]+))?\s*(.*)$/,
        /^\s*(-[a-zA-Z])\s*(?:\s+([A-Z_]+))?\s*(.*)$/,
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const [, flag1, flag2, valuePattern, description] = match;
          const hasValue = Boolean(valuePattern);
          
          if (flag1 && flag1.startsWith('-')) {
            options.push({
              flag: flag1,
              description: description || '',
              hasValue
            });
          }
          
          if (flag2 && flag2.startsWith('--')) {
            options.push({
              flag: flag2,
              description: description || '',
              hasValue
            });
          }
          
          break;
        }
      }
    }
    
    return options;
  }

  private extractOptionsFromMan(manContent: string): Array<{flag: string, description: string, hasValue: boolean}> {
    const options: Array<{flag: string, description: string, hasValue: boolean}> = [];
    
    // Look for OPTIONS section
    const optionsMatch = manContent.match(/OPTIONS\s*\n(.*?)(?=\n[A-Z]|\n\s*$)/s);
    if (optionsMatch) {
      const optionsSection = optionsMatch[1];
      const lines = optionsSection.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^\s*(-[a-zA-Z](?:,\s*)?|--[a-zA-Z][a-zA-Z0-9-]*)\s*(?:[=\s]([A-Z_]+))?\s*(.*)$/);
        if (match) {
          const [, flags, valuePattern, description] = match;
          const hasValue = Boolean(valuePattern);
          
          const flagList = flags.split(',').map(f => f.trim());
          for (const flag of flagList) {
            if (flag.startsWith('-')) {
              options.push({
                flag: flag.trim(),
                description: description.trim(),
                hasValue
              });
            }
          }
        }
      }
    }
    
    return options;
  }
}