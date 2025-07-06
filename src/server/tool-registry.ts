import { BaseTool } from '../tools/base.js';
import { MiddlewareFunction, ToolContext, ToolResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { ValidationError } from '../errors/index.js';

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private globalMiddleware: MiddlewareFunction[] = [];

  register(tool: BaseTool): void {
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

  unregister(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      logger.info(`Unregistered tool: ${toolName}`);
    }
    return removed;
  }

  getTool(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName);
  }

  getAllTools(): Map<string, BaseTool> {
    return new Map(this.tools);
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  addGlobalMiddleware(middleware: MiddlewareFunction): void {
    this.globalMiddleware.push(middleware);
    
    // Apply to all existing tools
    this.tools.forEach(tool => {
      tool.addMiddleware(middleware);
    });
  }

  async executeTool(
    toolName: string,
    args: Record<string, any>,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.getTool(toolName);
    
    if (!tool) {
      throw new ValidationError(`Tool not found: ${toolName}`);
    }

    return tool.run(args, context);
  }

  getToolInfo(): Array<{
    name: string;
    description: string;
  }> {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.getDescription()
    }));
  }
}