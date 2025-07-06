Using the [MCP-PROJECT-TEMPLATE](./MCP-PROJECT-TEMPLATE.md), and referencing [the seed prompt examples](./MCP-SEED-PROMPT-EXAMPLES.md), implement a complete MCP application (both client and server) for **[DOMAIN]**.

Analyze this domain and:
- Generate several tools that enable an MVP for this domain
- Identify external services to integrate
- Determine necessary middleware (caching, rate limiting, etc)
- Determine and implement a service layer structure
- Generate BOTH server and client implementations using the [MCP-PROJECT-TEMPLATE](./MCP-PROJECT-TEMPLATE.md)
- Include client usage examples showing how to interact with the server
- Ensure the implementation follows the exact project structure from the template

## Implementation Requirements

**CRITICAL**: You must follow the template structure exactly. Do not deviate from the established patterns unless explicitly instructed otherwise.

### Required Components:
1. **MCP Server** (`src/core/server.js`) - Tool hosting and execution
2. **MCP Client** (`src/core/client.js`) - Tool discovery and invocation
3. **Tool Registry** (`src/tools/registry.js`) - Tool management with middleware
4. **Base Tool Class** (`src/core/base-tool.js`) - All tools must extend this
5. **Configuration System** (`src/config/index.js`) - Both server and client config
6. **Error Handling** (`src/errors/index.js`) - Proper error taxonomy
7. **Observability** (`src/observability/logger.js`) - Structured logging
8. **Testing Utilities** (`test/test-utils.js`) - Mock server and client
9. **Examples** (`examples/`) - Client usage demonstrations

### Code Quality Standards:
- All tools must extend `BaseTool` class
- Use the middleware system for cross-cutting concerns
- Implement proper error handling with specific error types
- Include comprehensive logging with structured data
- Follow the service layer pattern for external integrations
- Use the configuration system for all settings
- Include both unit and integration tests

### File Structure Compliance:
- Place domain-specific tools in `src/tools/[domain]/`
- Place business logic in `src/services/`
- Use the exact directory structure from the template
- Include proper imports and exports
- Follow the established naming conventions

**Domain:** [INFO ABOUT YOUR DOMAIN HERE]
**Additional requirements:** [ANY SPECIFIC NEEDS]
**Planning document:** [PLANNING_CONTENT]

## Template Adherence Checklist

Ensure your implementation includes:
- [ ] MCP Server with tool registration and middleware
- [ ] MCP Client with connection management and retry logic
- [ ] All tools extending BaseTool class
- [ ] Proper error handling using MCPError taxonomy
- [ ] Configuration management for both client and server
- [ ] Structured logging throughout the application
- [ ] Service layer for external API integrations
- [ ] Middleware for cross-cutting concerns (logging, rate limiting, etc.)
- [ ] Comprehensive testing with both mock server and client
- [ ] Client usage examples in the examples/ directory
- [ ] Exact directory structure matching the template
- [ ] Proper package.json with all required dependencies