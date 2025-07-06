import { z } from 'zod';
export const ShellTypeSchema = z.enum(['bash', 'zsh', 'fish']);
export const CompletionConfigSchema = z.object({
    targetCommand: z.string(),
    shellType: ShellTypeSchema,
    outputPath: z.string().optional(),
    installPath: z.string().optional(),
    verbose: z.boolean().default(false),
});
export const HelpOutputSchema = z.object({
    command: z.string(),
    helpText: z.string(),
    exitCode: z.number(),
    stderr: z.string(),
});
export const ManPageSchema = z.object({
    command: z.string(),
    section: z.string(),
    content: z.string(),
    available: z.boolean(),
});
export const CompletionScriptSchema = z.object({
    command: z.string(),
    shellType: ShellTypeSchema,
    script: z.string(),
    installInstructions: z.string(),
});
export const CommandInfoSchema = z.object({
    command: z.string(),
    helpOutput: HelpOutputSchema,
    manPage: ManPageSchema,
    version: z.string().optional(),
    subcommands: z.array(z.string()).default([]),
    options: z.array(z.object({
        flag: z.string(),
        description: z.string(),
        hasValue: z.boolean(),
    })).default([]),
});
