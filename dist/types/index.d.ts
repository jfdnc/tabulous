import { z } from 'zod';
export declare const ShellTypeSchema: z.ZodEnum<["bash", "zsh", "fish"]>;
export type ShellType = z.infer<typeof ShellTypeSchema>;
export declare const CompletionConfigSchema: z.ZodObject<{
    targetCommand: z.ZodString;
    shellType: z.ZodEnum<["bash", "zsh", "fish"]>;
    outputPath: z.ZodOptional<z.ZodString>;
    installPath: z.ZodOptional<z.ZodString>;
    verbose: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    targetCommand: string;
    shellType: "bash" | "zsh" | "fish";
    verbose: boolean;
    outputPath?: string | undefined;
    installPath?: string | undefined;
}, {
    targetCommand: string;
    shellType: "bash" | "zsh" | "fish";
    outputPath?: string | undefined;
    installPath?: string | undefined;
    verbose?: boolean | undefined;
}>;
export type CompletionConfig = z.infer<typeof CompletionConfigSchema>;
export declare const HelpOutputSchema: z.ZodObject<{
    command: z.ZodString;
    helpText: z.ZodString;
    exitCode: z.ZodNumber;
    stderr: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command: string;
    helpText: string;
    exitCode: number;
    stderr: string;
}, {
    command: string;
    helpText: string;
    exitCode: number;
    stderr: string;
}>;
export type HelpOutput = z.infer<typeof HelpOutputSchema>;
export declare const ManPageSchema: z.ZodObject<{
    command: z.ZodString;
    section: z.ZodString;
    content: z.ZodString;
    available: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    command: string;
    section: string;
    content: string;
    available: boolean;
}, {
    command: string;
    section: string;
    content: string;
    available: boolean;
}>;
export type ManPage = z.infer<typeof ManPageSchema>;
export declare const CompletionScriptSchema: z.ZodObject<{
    command: z.ZodString;
    shellType: z.ZodEnum<["bash", "zsh", "fish"]>;
    script: z.ZodString;
    installInstructions: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shellType: "bash" | "zsh" | "fish";
    command: string;
    script: string;
    installInstructions: string;
}, {
    shellType: "bash" | "zsh" | "fish";
    command: string;
    script: string;
    installInstructions: string;
}>;
export type CompletionScript = z.infer<typeof CompletionScriptSchema>;
export declare const CommandInfoSchema: z.ZodObject<{
    command: z.ZodString;
    helpOutput: z.ZodObject<{
        command: z.ZodString;
        helpText: z.ZodString;
        exitCode: z.ZodNumber;
        stderr: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        command: string;
        helpText: string;
        exitCode: number;
        stderr: string;
    }, {
        command: string;
        helpText: string;
        exitCode: number;
        stderr: string;
    }>;
    manPage: z.ZodObject<{
        command: z.ZodString;
        section: z.ZodString;
        content: z.ZodString;
        available: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        command: string;
        section: string;
        content: string;
        available: boolean;
    }, {
        command: string;
        section: string;
        content: string;
        available: boolean;
    }>;
    version: z.ZodOptional<z.ZodString>;
    subcommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    options: z.ZodDefault<z.ZodArray<z.ZodObject<{
        flag: z.ZodString;
        description: z.ZodString;
        hasValue: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        flag: string;
        description: string;
        hasValue: boolean;
    }, {
        flag: string;
        description: string;
        hasValue: boolean;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    options: {
        flag: string;
        description: string;
        hasValue: boolean;
    }[];
    command: string;
    helpOutput: {
        command: string;
        helpText: string;
        exitCode: number;
        stderr: string;
    };
    manPage: {
        command: string;
        section: string;
        content: string;
        available: boolean;
    };
    subcommands: string[];
    version?: string | undefined;
}, {
    command: string;
    helpOutput: {
        command: string;
        helpText: string;
        exitCode: number;
        stderr: string;
    };
    manPage: {
        command: string;
        section: string;
        content: string;
        available: boolean;
    };
    version?: string | undefined;
    options?: {
        flag: string;
        description: string;
        hasValue: boolean;
    }[] | undefined;
    subcommands?: string[] | undefined;
}>;
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
export type MiddlewareFunction = (context: MiddlewareContext, next: () => Promise<ToolResult>) => Promise<ToolResult>;
