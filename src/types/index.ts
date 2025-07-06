import { z } from 'zod';

export const ShellTypeSchema = z.enum(['bash', 'zsh', 'fish']);
export type ShellType = z.infer<typeof ShellTypeSchema>;

export const CompletionConfigSchema = z.object({
  targetCommand: z.string(),
  shellType: ShellTypeSchema,
  outputPath: z.string().optional(),
  installPath: z.string().optional(),
  verbose: z.boolean().default(false),
});
export type CompletionConfig = z.infer<typeof CompletionConfigSchema>;

export const HelpOutputSchema = z.object({
  command: z.string(),
  helpText: z.string(),
  exitCode: z.number(),
  stderr: z.string(),
});
export type HelpOutput = z.infer<typeof HelpOutputSchema>;

export const ManPageSchema = z.object({
  command: z.string(),
  section: z.string(),
  content: z.string(),
  available: z.boolean(),
});
export type ManPage = z.infer<typeof ManPageSchema>;

export const CompletionScriptSchema = z.object({
  command: z.string(),
  shellType: ShellTypeSchema,
  script: z.string(),
  installInstructions: z.string(),
});
export type CompletionScript = z.infer<typeof CompletionScriptSchema>;

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
export type CommandInfo = z.infer<typeof CommandInfoSchema>;

export interface ToolContext {
  requestId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MiddlewareContext {
  toolName: string;
  args: Record<string, any>;
  context: ToolContext;
}

export type MiddlewareFunction = (
  context: MiddlewareContext,
  next: () => Promise<ToolResult>
) => Promise<ToolResult>;