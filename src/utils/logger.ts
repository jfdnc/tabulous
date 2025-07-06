import winston from 'winston';

export interface LogContext {
  requestId?: string;
  toolName?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  private formatMessage(message: string, context?: LogContext) {
    const meta = {
      ...(context?.metadata || {}),
      requestId: context?.requestId,
      toolName: context?.toolName,
    };
    
    return { message, ...meta };
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(this.formatMessage(message, context));
  }

  info(message: string, context?: LogContext) {
    this.logger.info(this.formatMessage(message, context));
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(this.formatMessage(message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.logger.error(this.formatMessage(message, context), { error });
  }
}

export const logger = new Logger();