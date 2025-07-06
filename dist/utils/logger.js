import winston from 'winston';
class Logger {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
                })
            ]
        });
    }
    formatMessage(message, context) {
        const meta = {
            ...(context?.metadata || {}),
            requestId: context?.requestId,
            toolName: context?.toolName,
        };
        return { message, ...meta };
    }
    debug(message, context) {
        this.logger.debug(this.formatMessage(message, context));
    }
    info(message, context) {
        this.logger.info(this.formatMessage(message, context));
    }
    warn(message, context) {
        this.logger.warn(this.formatMessage(message, context));
    }
    error(message, error, context) {
        this.logger.error(this.formatMessage(message, context), { error });
    }
}
export const logger = new Logger();
