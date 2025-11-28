import pino from 'pino';
import { config } from '../config/index.js';

/**
 * Application logger instance
 */
export const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

/**
 * Create a child logger with additional context
 */
export function createLogger(name: string): pino.Logger {
  return logger.child({ name });
}
