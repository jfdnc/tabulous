import { MiddlewareFunction } from '../types/index.js';
export declare class RateLimitMiddleware {
    private maxRequests;
    private windowMs;
    private requests;
    constructor(maxRequests?: number, windowMs?: number);
    middleware(): MiddlewareFunction;
}
export declare class LoggingMiddleware {
    middleware(): MiddlewareFunction;
}
export declare class TimeoutMiddleware {
    private timeoutMs;
    constructor(timeoutMs?: number);
    middleware(): MiddlewareFunction;
}
export declare class ValidationMiddleware {
    middleware(): MiddlewareFunction;
}
export declare class CachingMiddleware {
    private ttlMs;
    private cache;
    constructor(ttlMs?: number);
    middleware(): MiddlewareFunction;
    private generateCacheKey;
}
export declare function createDefaultMiddleware(): MiddlewareFunction[];
