import { BaseTool } from './base.js';
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
        super('command-analyzer', 'Analyze command documentation to extract structured information');
    }
    validateArgs(args) {
        try {
            CommandAnalyzerArgsSchema.parse(args);
        }
        catch (error) {
            throw new ValidationError(`Invalid arguments: ${error.message}`);
        }
    }
    async execute(args, context) {
        const { helpOutput, manPage, version } = CommandAnalyzerArgsSchema.parse(args);
        const commandInfo = {
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
    extractSubcommands(helpText, manContent) {
        const subcommands = new Set();
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
    extractSubcommandsFromHelp(helpText) {
        const subcommands = [];
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
    extractSubcommandsFromMan(manContent) {
        const subcommands = [];
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
    extractOptions(helpText, manContent) {
        const options = new Map();
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
    extractOptionsFromHelp(helpText) {
        const options = [];
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
    extractOptionsFromMan(manContent) {
        const options = [];
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
