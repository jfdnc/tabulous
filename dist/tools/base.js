import { logger } from '../utils/logger.js';
import { createErrorResponse } from '../errors/index.js';
export class BaseTool {
    name;
    description;
    middleware = [];
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    async run(args, context) {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`Tool execution failed: ${this.name}`, error, {
                requestId: context.requestId,
                toolName: this.name,
                metadata: { duration, args }
            });
            const errorResponse = createErrorResponse(error);
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
    async executeWithMiddleware(args, context) {
        let index = 0;
        const next = async () => {
            if (index >= this.middleware.length) {
                return this.execute(args, context);
            }
            const middleware = this.middleware[index++];
            return middleware({ toolName: this.name, args, context }, next);
        };
        return next();
    }
}
export class BaseAsyncTool extends BaseTool {
    timeout;
    constructor(name, description, timeout = 30000) {
        super(name, description);
        this.timeout = timeout;
    }
    async executeWithTimeout(operation, timeoutMs = this.timeout) {
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
