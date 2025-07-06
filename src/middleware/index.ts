import { MiddlewareFunction, MiddlewareContext, ToolResult } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { RateLimitError, TimeoutError } from '../errors/index.js';

export class RateLimitMiddleware {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  middleware(): MiddlewareFunction {
    return async (context: MiddlewareContext, next: () => Promise<ToolResult>): Promise<ToolResult> => {
      const key = `${context.toolName}:${context.context.requestId}`;
      const now = Date.now();
      
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      const requests = this.requests.get(key)!;
      
      // Clean old requests
      const validRequests = requests.filter(time => now - time < this.windowMs);
      this.requests.set(key, validRequests);
      
      if (validRequests.length >= this.maxRequests) {
        throw new RateLimitError(`Rate limit exceeded for tool: ${context.toolName}`);
      }
      
      validRequests.push(now);
      this.requests.set(key, validRequests);
      
      return next();
    };
  }
}

export class LoggingMiddleware {
  middleware(): MiddlewareFunction {
    return async (context: MiddlewareContext, next: () => Promise<ToolResult>): Promise<ToolResult> => {
      const startTime = Date.now();
      
      logger.info(`Tool middleware start: ${context.toolName}`, {
        requestId: context.context.requestId,
        toolName: context.toolName,
        metadata: { args: context.args }
      });
      
      try {
        const result = await next();
        const duration = Date.now() - startTime;
        
        logger.info(`Tool middleware complete: ${context.toolName}`, {
          requestId: context.context.requestId,
          toolName: context.toolName,
          metadata: { duration, success: result.success }
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(`Tool middleware error: ${context.toolName}`, error as Error, {
          requestId: context.context.requestId,
          toolName: context.toolName,
          metadata: { duration, args: context.args }
        });
        
        throw error;
      }
    };
  }
}

export class TimeoutMiddleware {
  constructor(private timeoutMs: number = 30000) {}

  middleware(): MiddlewareFunction {
    return async (context: MiddlewareContext, next: () => Promise<ToolResult>): Promise<ToolResult> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new TimeoutError(`Tool execution timed out after ${this.timeoutMs}ms: ${context.toolName}`));
        }, this.timeoutMs);

        next()
          .then(resolve)
          .catch(reject)
          .finally(() => clearTimeout(timer));
      });
    };
  }
}

export class ValidationMiddleware {
  middleware(): MiddlewareFunction {
    return async (context: MiddlewareContext, next: () => Promise<ToolResult>): Promise<ToolResult> => {
      // Basic validation
      if (!context.toolName || typeof context.toolName !== 'string') {
        throw new Error('Invalid tool name');
      }
      
      if (!context.context.requestId) {
        throw new Error('Request ID is required');
      }
      
      return next();
    };
  }
}

export class CachingMiddleware {
  private cache: Map<string, { result: ToolResult; timestamp: number }> = new Map();
  
  constructor(private ttlMs: number = 300000) {} // 5 minutes

  middleware(): MiddlewareFunction {
    return async (context: MiddlewareContext, next: () => Promise<ToolResult>): Promise<ToolResult> => {
      const cacheKey = this.generateCacheKey(context.toolName, context.args);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.ttlMs) {
        logger.debug(`Cache hit for tool: ${context.toolName}`, {
          requestId: context.context.requestId,
          toolName: context.toolName,
          metadata: { cacheKey }
        });
        
        return {
          ...cached.result,
          metadata: {
            ...cached.result.metadata,
            fromCache: true
          }
        };
      }
      
      const result = await next();
      
      if (result.success) {
        this.cache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }
      
      return result;
    };
  }

  private generateCacheKey(toolName: string, args: Record<string, any>): string {
    return `${toolName}:${JSON.stringify(args)}`;
  }
}

export function createDefaultMiddleware(): MiddlewareFunction[] {
  return [
    new ValidationMiddleware().middleware(),
    new LoggingMiddleware().middleware(),
    new RateLimitMiddleware().middleware(),
    new TimeoutMiddleware().middleware(),
    new CachingMiddleware().middleware(),
  ];
}