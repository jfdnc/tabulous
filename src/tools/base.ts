import { ToolContext, ToolResult, MiddlewareFunction } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { isKnownError, createErrorResponse } from '../errors/index.js';

export abstract class BaseTool {
  protected readonly name: string;
  protected readonly description: string;
  protected readonly middleware: MiddlewareFunction[] = [];

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  abstract execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult>;

  protected abstract validateArgs(args: Record<string, any>): void;

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public addMiddleware(middleware: MiddlewareFunction): void {
    this.middleware.push(middleware);
  }

  public async run(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    const startTime = Date.now();
    
    logger.info(`Executing tool: ${this.name}`, {
      requestId: context.requestId,
      toolName: this.name,
      metadata: { args, ...context.metadata }
    });

    try {
      this.validateArgs(args);
      
      const result = await this.executeWithMiddleware(args, context);
      
      const duration = Date.now() - startTime;
      logger.info(`Tool execution completed: ${this.name}`, {
        requestId: context.requestId,
        toolName: this.name,
        metadata: { duration, success: result.success }
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Tool execution failed: ${this.name}`, error as Error, {
        requestId: context.requestId,
        toolName: this.name,
        metadata: { duration, args }
      });
      
      const errorResponse = createErrorResponse(error as Error);
      return {
        success: false,
        error: errorResponse.message,
        metadata: {
          errorCode: errorResponse.code,
          statusCode: errorResponse.statusCode
        }
      };
    }
  }

  private async executeWithMiddleware(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    let index = 0;
    
    const next = async (): Promise<ToolResult> => {
      if (index >= this.middleware.length) {
        return this.execute(args, context);
      }
      
      const middleware = this.middleware[index++];
      return middleware(
        { toolName: this.name, args, context },
        next
      );
    };
    
    return next();
  }
}

export abstract class BaseAsyncTool extends BaseTool {
  protected readonly timeout: number;

  constructor(name: string, description: string, timeout: number = 30000) {
    super(name, description);
    this.timeout = timeout;
  }

  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }
}