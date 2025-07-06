#!/usr/bin/env node
import { Command } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { createAndConnectClient } from './client/index.js';
import { logger } from './utils/logger.js';
const __filename = fileURLToPath(import.meta.url);
const program = new Command();
program
    .name('tabulous')
    .description('Generate shell completion scripts for CLI tools using MCP')
    .version('1.0.0');
program
    .argument('<command>', 'The command to generate completions for')
    .option('-s, --shell <shell>', 'Target shell (bash, zsh, fish)', 'bash')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --install', 'Install completion to appropriate directory')
    .option('-a, --all-shells', 'Generate completions for all supported shells')
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (command, options) => {
    if (options.verbose) {
        process.env.LOG_LEVEL = 'debug';
    }
    try {
        const { client, service } = await createAndConnectClient();
        if (options.allShells) {
            const shells = ['bash', 'zsh', 'fish'];
            const scripts = await service.generateCompletionForMultipleShells(command, shells);
            for (const script of scripts) {
                const outputPath = options.output ||
                    join(homedir(), '.local', 'share', 'tabulous', `${command}_completion.${script.shellType}`);
                await writeCompletionFile(script.script, outputPath);
                if (options.install) {
                    await installCompletion(script, command);
                }
                console.log(`Generated ${script.shellType} completion: ${outputPath}`);
                if (!options.install) {
                    console.log('\nInstallation instructions:');
                    console.log(script.installInstructions);
                }
            }
        }
        else {
            const shellType = options.shell;
            await service.validateShellSupport(shellType);
            const config = {
                targetCommand: command,
                shellType,
                outputPath: options.output,
                verbose: options.verbose
            };
            const script = await service.generateCompletion(config);
            const outputPath = options.output ||
                join(homedir(), '.local', 'share', 'tabulous', `${command}_completion.${shellType}`);
            await writeCompletionFile(script.script, outputPath);
            if (options.install) {
                await installCompletion(script, command);
            }
            console.log(`Generated completion: ${outputPath}`);
            if (!options.install) {
                console.log('\nInstallation instructions:');
                console.log(script.installInstructions);
            }
        }
        await client.disconnect();
    }
    catch (error) {
        logger.error('CLI command failed', error);
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
program
    .command('list-tools')
    .description('List available MCP tools')
    .action(async () => {
    try {
        const { client, service } = await createAndConnectClient();
        const tools = await service.getAvailableTools();
        console.log('Available tools:');
        tools.forEach(tool => {
            console.log(`  ${tool.name}: ${tool.description}`);
        });
        await client.disconnect();
    }
    catch (error) {
        logger.error('Failed to list tools', error);
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
program
    .command('test-connection')
    .description('Test connection to MCP server')
    .action(async () => {
    try {
        const { client, service } = await createAndConnectClient();
        const isConnected = await service.testConnection();
        if (isConnected) {
            console.log('✓ Connection successful');
        }
        else {
            console.log('✗ Connection failed');
            process.exit(1);
        }
        await client.disconnect();
    }
    catch (error) {
        logger.error('Connection test failed', error);
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
async function writeCompletionFile(content, filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content, 'utf8');
}
async function installCompletion(script, command) {
    const { shellType } = script;
    let installPath;
    switch (shellType) {
        case 'bash':
            installPath = join(homedir(), '.bash_completion.d', `${command}`);
            break;
        case 'zsh':
            installPath = join(homedir(), '.config', 'zsh', 'completions', `_${command}`);
            break;
        case 'fish':
            installPath = join(homedir(), '.config', 'fish', 'completions', `${command}.fish`);
            break;
        default:
            throw new Error(`Unsupported shell for installation: ${shellType}`);
    }
    await writeCompletionFile(script.script, installPath);
    console.log(`Installed ${shellType} completion: ${installPath}`);
}
if (process.argv[1] === __filename) {
    program.parse();
}
