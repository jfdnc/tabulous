import { BaseTool } from './base.js';
import { ToolContext, ToolResult, CommandInfo, CompletionScript, ShellType } from '../types/index.js';
import { CompletionGenerationError, ValidationError, UnsupportedShellError } from '../errors/index.js';
import { z } from 'zod';

const CompletionGeneratorArgsSchema = z.object({
  commandInfo: z.object({
    command: z.string(),
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
    subcommands: z.array(z.string()).default([]),
    options: z.array(z.object({
      flag: z.string(),
      description: z.string(),
      hasValue: z.boolean(),
    })).default([]),
  }),
  shellType: z.enum(['bash', 'zsh', 'fish']),
  enableAdvancedFeatures: z.boolean().default(true),
});

export class CompletionGeneratorTool extends BaseTool {
  constructor() {
    super(
      'completion-generator',
      'Generate shell completion scripts from command documentation'
    );
  }

  protected validateArgs(args: Record<string, any>): void {
    try {
      CompletionGeneratorArgsSchema.parse(args);
    } catch (error) {
      throw new ValidationError(`Invalid arguments: ${(error as Error).message}`);
    }
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const { commandInfo, shellType, enableAdvancedFeatures } = CompletionGeneratorArgsSchema.parse(args);

    try {
      const parsedOptions = this.parseOptionsFromHelp(commandInfo.helpOutput.helpText);
      const enhancedCommandInfo = {
        ...commandInfo,
        options: parsedOptions.length > 0 ? parsedOptions : commandInfo.options
      };

      const script = this.generateCompletionScript(enhancedCommandInfo, shellType, enableAdvancedFeatures);
      const installInstructions = this.generateInstallInstructions(commandInfo.command, shellType);

      const completionScript: CompletionScript = {
        command: commandInfo.command,
        shellType,
        script,
        installInstructions
      };

      return {
        success: true,
        data: completionScript,
        metadata: {
          optionsCount: enhancedCommandInfo.options.length,
          subcommandsCount: enhancedCommandInfo.subcommands.length,
          hasManPage: commandInfo.manPage.available
        }
      };
    } catch (error) {
      throw new CompletionGenerationError(
        `Failed to generate completion script: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  private parseOptionsFromHelp(helpText: string): Array<{flag: string, description: string, hasValue: boolean}> {
    const options: Array<{flag: string, description: string, hasValue: boolean}> = [];
    const lines = helpText.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match patterns like: -h, --help, -f FILE, --file=FILE
      const optionMatch = line.match(/^\s*(-[a-zA-Z](?:,\s*)?|--[a-zA-Z][a-zA-Z0-9-]*)\s*(?:[=\s]([A-Z_]+))?\s*(.*)$/);
      
      if (optionMatch) {
        const [, flags, valuePattern, description] = optionMatch;
        const hasValue = Boolean(valuePattern);
        
        // Split multiple flags (e.g., "-h, --help")
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
    
    return options;
  }

  private generateCompletionScript(commandInfo: CommandInfo, shellType: ShellType, enableAdvancedFeatures: boolean): string {
    switch (shellType) {
      case 'bash':
        return this.generateBashCompletion(commandInfo, enableAdvancedFeatures);
      case 'zsh':
        return this.generateZshCompletion(commandInfo, enableAdvancedFeatures);
      case 'fish':
        return this.generateFishCompletion(commandInfo, enableAdvancedFeatures);
      default:
        throw new UnsupportedShellError(`Unsupported shell type: ${shellType}`);
    }
  }

  private generateBashCompletion(commandInfo: CommandInfo, enableAdvancedFeatures: boolean): string {
    const cmd = commandInfo.command;
    const options = commandInfo.options.map(opt => opt.flag).join(' ');
    const subcommands = commandInfo.subcommands.join(' ');

    return `# Bash completion for ${cmd}
_${cmd}_completion() {
    local cur prev words cword
    _init_completion || return

    local opts="${options}"
    local subcommands="${subcommands}"

    case "\${prev}" in
        ${commandInfo.options.filter(opt => opt.hasValue).map(opt => 
          `${opt.flag})\n            COMPREPLY=($(compgen -f -- "\${cur}"))\n            return 0\n            ;;`
        ).join('\n        ')}
    esac

    if [[ \${cur} == -* ]]; then
        COMPREPLY=($(compgen -W "\${opts}" -- "\${cur}"))
        return 0
    fi

    if [[ \${#words[@]} -eq 2 && -n "\${subcommands}" ]]; then
        COMPREPLY=($(compgen -W "\${subcommands}" -- "\${cur}"))
        return 0
    fi

    COMPREPLY=($(compgen -f -- "\${cur}"))
}

complete -F _${cmd}_completion ${cmd}`;
  }

  private generateZshCompletion(commandInfo: CommandInfo, enableAdvancedFeatures: boolean): string {
    const cmd = commandInfo.command;
    const options = commandInfo.options.map(opt => {
      const hasValue = opt.hasValue ? ':file:_files' : '';
      return `  '${opt.flag}[${opt.description}]${hasValue}'`;
    }).join('\n');

    const subcommands = commandInfo.subcommands.map(sub => 
      `    '${sub}:${sub} command'`
    ).join('\n');

    return `#compdef ${cmd}
# Zsh completion for ${cmd}

_${cmd}() {
    local context state line
    typeset -A opt_args

    _arguments -C \\
${options}
${subcommands ? `        '1:subcommand:(${commandInfo.subcommands.join(' ')})' \\` : ''}
        '*:file:_files'
}

_${cmd} "$@"`;
  }

  private generateFishCompletion(commandInfo: CommandInfo, enableAdvancedFeatures: boolean): string {
    const cmd = commandInfo.command;
    
    const options = commandInfo.options.map(opt => {
      const shortFlag = opt.flag.match(/^-([a-zA-Z])$/)?.[1];
      const longFlag = opt.flag.match(/^--([a-zA-Z][a-zA-Z0-9-]*)$/)?.[1];
      
      let completion = `complete -c ${cmd}`;
      if (shortFlag) completion += ` -s ${shortFlag}`;
      if (longFlag) completion += ` -l ${longFlag}`;
      if (opt.hasValue) completion += ` -r -F`;
      completion += ` -d '${opt.description.replace(/'/g, "\\'")}'`;
      
      return completion;
    }).join('\n');

    const subcommands = commandInfo.subcommands.map(sub => 
      `complete -c ${cmd} -n '__fish_use_subcommand' -a '${sub}' -d '${sub} command'`
    ).join('\n');

    return `# Fish completion for ${cmd}

${options}
${subcommands}

# File completion for remaining arguments
complete -c ${cmd} -f`;
  }

  private generateInstallInstructions(command: string, shellType: ShellType): string {
    const scriptName = `${command}_completion.${shellType}`;
    
    switch (shellType) {
      case 'bash':
        return `# Installation instructions for Bash completion:
# 1. Save this script as: ~/.bash_completion.d/${scriptName}
# 2. Or source it directly in your ~/.bashrc:
#    source /path/to/${scriptName}
# 3. Restart your shell or run: source ~/.bashrc`;

      case 'zsh':
        return `# Installation instructions for Zsh completion:
# 1. Save this script as: ~/.config/zsh/completions/_${command}
# 2. Or add to your fpath in ~/.zshrc:
#    fpath=(~/.config/zsh/completions $fpath)
# 3. Restart your shell or run: autoload -U compinit && compinit`;

      case 'fish':
        return `# Installation instructions for Fish completion:
# 1. Save this script as: ~/.config/fish/completions/${command}.fish
# 2. Restart your shell or run: fish -c "complete -r ${command}"`;

      default:
        return 'Unknown shell type';
    }
  }
}