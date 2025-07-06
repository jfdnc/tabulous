import { logger } from '../utils/logger.js';
import { ValidationError } from '../errors/index.js';
export class ToolRegistry {
    tools = new Map();
    globalMiddleware = [];
    register(tool) {
        const toolName = tool.getName();
        if (this.tools.has(toolName)) {
            logger.warn(`Tool ${toolName} is already registered, overwriting`);
        }
        // Apply global middleware to the tool
        this.globalMiddleware.forEach(middleware => {
            tool.addMiddleware(middleware);
        });
        this.tools.set(toolName, tool);
        logger.info(`Registered tool: ${toolName}`);
    }
    unregister(toolName) {
        const removed = this.tools.delete(toolName);
        if (removed) {
            logger.info(`Unregistered tool: ${toolName}`);
        }
        return removed;
    }
    getTool(toolName) {
        return this.tools.get(toolName);
    }
    getAllTools() {
        return new Map(this.tools);
    }
    getToolNames() {
        return Array.from(this.tools.keys());
    }
    addGlobalMiddleware(middleware) {
        this.globalMiddleware.push(middleware);
        // Apply to all existing tools
        this.tools.forEach(tool => {
            tool.addMiddleware(middleware);
        });
    }
    async executeTool(toolName, args, context) {
        const tool = this.getTool(toolName);
        if (!tool) {
            throw new ValidationError(`Tool not found: ${toolName}`);
        }
        return tool.run(args, context);
    }
    getToolInfo() {
        return Array.from(this.tools.entries()).map(([name, tool]) => ({
            name,
            description: tool.getDescription()
        }));
    }
}
