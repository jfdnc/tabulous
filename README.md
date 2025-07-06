# Tabulous

A powerful MCP (Model Context Protocol) application for generating shell completion scripts for any CLI tool using AI.

## Features

- 🔧 **Universal CLI Support**: Generate completions for any command-line tool
- 🐚 **Multi-Shell Support**: Supports Bash, Zsh, and Fish shells
- 🤖 **AI-Powered**: Uses Claude 3.7 via MCP to analyze command documentation
- 📖 **Smart Analysis**: Extracts options and subcommands from help text and man pages
- 🚀 **Easy Installation**: One-click installation to appropriate shell directories
- 🔌 **MCP Architecture**: Built with modern Model Context Protocol for extensibility

## Installation

```bash
npm install -g tabulous
```

## Quick Start

### Generate a completion script:

```bash
# Generate bash completion for git
tabulous git --shell bash

# Generate for all shells
tabulous docker --all-shells

# Generate and install automatically
tabulous kubectl --shell zsh --install
```

### Using as a library:

```typescript
import { createAndConnectClient } from 'tabulous';

const { client, service } = await createAndConnectClient();

const completion = await service.generateCompletion({
  targetCommand: 'git',
  shellType: 'bash'
});

console.log(completion.script);
```

## Architecture

Tabulous uses the Model Context Protocol (MCP) architecture:

- **MCP Server**: Hosts tools for help extraction, man page parsing, and completion generation
- **MCP Client**: Connects to server and orchestrates completion generation
- **Tools**: Specialized tools for different aspects of completion generation
- **Middleware**: Cross-cutting concerns like logging, caching, and rate limiting

## Available Tools

- `help-extractor`: Extracts help text from CLI commands
- `man-page-parser`: Parses manual pages for additional context
- `command-analyzer`: Analyzes command structure and options
- `completion-generator`: Generates shell-specific completion scripts

## Configuration

Environment variables:
- `TABULOUS_LOG_LEVEL`: Set logging level (debug, info, warn, error)
- `TABULOUS_DEFAULT_SHELL`: Default shell type (bash, zsh, fish)
- `TABULOUS_OUTPUT_DIR`: Default output directory

## Examples

See the `examples/` directory for usage examples:
- `basic-usage.ts`: Simple completion generation
- `multi-shell.ts`: Generate for multiple shells

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

## License

MIT