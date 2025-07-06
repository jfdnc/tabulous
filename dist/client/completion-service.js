import { logger } from '../utils/logger.js';
import { CommandNotFoundError, CompletionGenerationError, UnsupportedShellError } from '../errors/index.js';
export class CompletionService {
    client;
    config;
    constructor(config, client) {
        this.config = config;
        this.client = client;
    }
    async generateCompletion(completionConfig) {
        const { targetCommand, shellType } = completionConfig;
        logger.info(`Generating completion for command: ${targetCommand}`, {
            metadata: { targetCommand, shellType }
        });
        try {
            // Step 1: Extract help text
            const helpResult = await this.client.callTool('help-extractor', {
                command: targetCommand,
                helpFlags: ['--help', '-h', 'help'],
                timeout: 10000
            });
            if (!helpResult.success) {
                throw new CommandNotFoundError(`Failed to extract help for command: ${targetCommand}. ${helpResult.error}`);
            }
            const helpOutput = helpResult.data;
            // Step 2: Parse man page
            const manResult = await this.client.callTool('man-page-parser', {
                command: targetCommand,
                sections: ['1', '8'],
                timeout: 10000
            });
            const manPage = manResult.success ? manResult.data : {
                command: targetCommand,
                section: '',
                content: '',
                available: false
            };
            // Step 3: Analyze command information
            const analyzeResult = await this.client.callTool('command-analyzer', {
                helpOutput,
                manPage,
                version: undefined // Could be extracted separately
            });
            if (!analyzeResult.success) {
                throw new CompletionGenerationError(`Failed to analyze command: ${targetCommand}. ${analyzeResult.error}`);
            }
            const commandInfo = analyzeResult.data;
            // Step 4: Generate completion script
            const completionResult = await this.client.callTool('completion-generator', {
                commandInfo,
                shellType,
                enableAdvancedFeatures: true
            });
            if (!completionResult.success) {
                throw new CompletionGenerationError(`Failed to generate completion script: ${completionResult.error}`);
            }
            const completionScript = completionResult.data;
            logger.info(`Successfully generated completion for: ${targetCommand}`, {
                metadata: {
                    targetCommand,
                    shellType,
                    optionsCount: commandInfo.options.length,
                    subcommandsCount: commandInfo.subcommands.length
                }
            });
            return completionScript;
        }
        catch (error) {
            logger.error(`Failed to generate completion for: ${targetCommand}`, error);
            throw error;
        }
    }
    async generateCompletionForMultipleShells(targetCommand, shells) {
        const results = [];
        const errors = [];
        for (const shell of shells) {
            try {
                const config = {
                    targetCommand,
                    shellType: shell
                };
                const script = await this.generateCompletion(config);
                results.push(script);
            }
            catch (error) {
                errors.push({ shell, error: error });
            }
        }
        if (errors.length > 0) {
            logger.warn(`Some shells failed during completion generation for: ${targetCommand}`, {
                metadata: { errors: errors.map(e => ({ shell: e.shell, error: e.error.message })) }
            });
        }
        if (results.length === 0) {
            throw new CompletionGenerationError(`Failed to generate completions for any shell: ${shells.join(', ')}`);
        }
        return results;
    }
    async validateShellSupport(shellType) {
        const supportedShells = ['bash', 'zsh', 'fish'];
        if (!supportedShells.includes(shellType)) {
            throw new UnsupportedShellError(`Unsupported shell: ${shellType}`);
        }
        return true;
    }
    async getAvailableTools() {
        try {
            return await this.client.listTools();
        }
        catch (error) {
            logger.error('Failed to get available tools', error);
            throw error;
        }
    }
    async testConnection() {
        try {
            await this.getAvailableTools();
            return true;
        }
        catch (error) {
            logger.error('Connection test failed', error);
            return false;
        }
    }
}
