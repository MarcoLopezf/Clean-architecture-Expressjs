import pino, {
  type Logger as PinoInstance,
  type LoggerOptions,
  type Level as PinoLevel
} from 'pino';

import {
  type LoggerMetadata,
  type LoggerPort
} from '../../application/ports/logger.port';

const isProduction = process.env.NODE_ENV === 'production';

const baseOptions: LoggerOptions = {
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  },
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o'
        }
      }
};

class PinoLoggerAdapter implements LoggerPort {
  constructor(private readonly logger: PinoInstance) {}

  debug(message: string, metadata?: LoggerMetadata): void {
    this.write('debug', message, metadata);
  }

  info(message: string, metadata?: LoggerMetadata): void {
    this.write('info', message, metadata);
  }

  warn(message: string, metadata?: LoggerMetadata): void {
    this.write('warn', message, metadata);
  }

  error(message: string, metadata?: LoggerMetadata): void {
    this.write('error', message, metadata);
  }

  child(bindings: LoggerMetadata): LoggerPort {
    return new PinoLoggerAdapter(this.logger.child(bindings));
  }

  private write(
    level: PinoLevel,
    message: string,
    metadata: LoggerMetadata = {}
  ): void {
    const serializedMetadata =
      metadata.error instanceof Error
        ? {
            ...metadata,
            error: pino.stdSerializers.err(metadata.error)
          }
        : metadata;

    this.logger[level](serializedMetadata, message);
  }
}

export interface PinoLoggerBundle {
  logger: LoggerPort;
  instance: PinoInstance;
}

export const createPinoLogger = (options?: LoggerOptions): PinoLoggerBundle => {
  const instance = pino({ ...baseOptions, ...options });
  return {
    logger: new PinoLoggerAdapter(instance),
    instance
  };
};

const { logger, instance: pinoInstance } = createPinoLogger();

export { logger, pinoInstance };

export type { PinoLoggerAdapter };
