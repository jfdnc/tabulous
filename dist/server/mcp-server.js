import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from './tool-registry.js';
import { logger } from '../utils/logger.js';
import { createErrorResponse } from '../errors/index.js';
import { createDefaultMiddleware } from '../middleware/index.js';
export class MCPServer {
    server;
    toolRegistry;
    config;
    constructor(config) {
        this.config = config;
        this.toolRegistry = new ToolRegistry();
        this.server = new Server({
            name: config.name,
            version: config.version,
        }, {
            capabilities: {
                tools: {}
            }
        });
        this.setupHandlers();
        this.setupMiddleware();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = this.toolRegistry.getToolInfo();
            logger.info('Listed tools', {
                metadata: { toolCount: tools.length }
            });
            return {
                tools: tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: []
                    }
                }))
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const requestId = this.generateRequestId();
            const context = {
                requestId,
                timestamp: Date.now(),
                metadata: {
                    toolName: name,
                    requestParams: request.params
                }
            };
            logger.info(`Executing tool: ${name}`, {
                requestId,
                toolName: name,
                metadata: { args }
            });
            try {
                const result = await this.toolRegistry.executeTool(name, args || {}, context);
                if (result.success) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result.data, null, 2)
                            }
                        ]
                    };
                }
                else {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${result.error}`
                            }
                        ],
                        isError: true
                    };
                }
            }
            catch (error) {
                logger.error(`Tool execution failed: ${name}`, error, {
                    requestId,
                    toolName: name,
                    metadata: { args }
                });
                const errorResponse = createErrorResponse(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${errorResponse.message}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    setupMiddleware() {
        const middleware = createDefaultMiddleware();
        middleware.forEach(mw => this.toolRegistry.addGlobalMiddleware(mw));
    }
    registerTool(tool) {
        this.toolRegistry.register(tool);
    }
    async start() {
        logger.info(`Starting MCP server: ${this.config.name}`, {
            metadata: {
                version: this.config.version,
                config: this.config
            }
        });
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        logger.info('MCP server started and connected');
    }
    async stop() {
        logger.info('Stopping MCP server');
        await this.server.close();
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getToolRegistry() {
        return this.toolRegistry;
    }
}
