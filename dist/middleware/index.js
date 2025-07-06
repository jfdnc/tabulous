import { logger } from '../utils/logger.js';
import { RateLimitError, TimeoutError } from '../errors/index.js';
export class RateLimitMiddleware {
    maxRequests;
    windowMs;
    requests = new Map();
    constructor(maxRequests = 100, windowMs = 60000 // 1 minute
    ) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    middleware() {
        return async (context, next) => {
            const key = `${context.toolName}:${context.context.requestId}`;
            const now = Date.now();
            if (!this.requests.has(key)) {
                this.requests.set(key, []);
            }
            const requests = this.requests.get(key);
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
    middleware() {
        return async (context, next) => {
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
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.error(`Tool middleware error: ${context.toolName}`, error, {
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
    timeoutMs;
    constructor(timeoutMs = 30000) {
        this.timeoutMs = timeoutMs;
    }
    middleware() {
        return async (context, next) => {
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
    middleware() {
        return async (context, next) => {
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
    ttlMs;
    cache = new Map();
    constructor(ttlMs = 300000) {
        this.ttlMs = ttlMs;
    } // 5 minutes
    middleware() {
        return async (context, next) => {
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
    generateCacheKey(toolName, args) {
        return `${toolName}:${JSON.stringify(args)}`;
    }
}
export function createDefaultMiddleware() {
    return [
        new ValidationMiddleware().middleware(),
        new LoggingMiddleware().middleware(),
        new RateLimitMiddleware().middleware(),
        new TimeoutMiddleware().middleware(),
        new CachingMiddleware().middleware(),
    ];
}
