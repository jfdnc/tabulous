# Project Overview: Auto-Generating Shell Completions via LLM and MCP

## Concept
A command-line tool called `tabulous` that auto-generates shell completion scripts for any given CLI tool by leveraging a local LLM connected via Model Context Protocol (MCP). The system dynamically gathers context from the target CLI's `--help` output, man pages, and potentially other local sources, and produces a ready-to-use shell completion script.

## Key Components
- **CLI Entry Point:**  
  Usage: `tabulous foo`  
  - `foo` is the target binary for which completions will be generated.

- **MCP Query Tools:**  
  - Subprocess invocations to:
    - Run `foo --help`
    - Run `man foo`
    - Run additional discovery commands (e.g. `foo --version`, `foo -h`)

- **MCP Server:**  
  - Handles LLM interaction and tool orchestration.
  - Provides MCP methods for querying documentation and for shell script generation.

- **LLM Integration:**  
  - Consumes documentation and help text.
  - Generates shell completion scripts for supported shells (Bash, Zsh, Fish).

- **Completion Installer:**  
  - Writes generated completions to appropriate system or user directories.
  - Optionally supports shell-specific registration or prompts the user to reload their shell environment.

## Technical Notes
- Fully feasible using standard CLI argument passing and subprocess calls.
- No need for shell-specific hacks; works in Bash, Zsh, Fish via standard shell conventions.
- Requires some handling of edge cases like missing man pages or non-standard help flags.
- Supports extensibility via shell targeting (`--shell bash`, `--shell zsh`).

## Value Proposition
- Eliminates manual writing of shell completions.
- Useful for both public and internal CLI tools.
- Updates completions as tools evolve.
- Fills a gap not fully addressed by current LLM-powered terminal tools (which focus more on inline suggestions rather than generating portable, installable completion scripts).

## Potential Future Features
- Support for recursive subcommand parsing.
- Incremental completion updates when CLI tools change.
- Integration with local command history for context-aware suggestions.
- Option to bundle generated completions into package distributions.

