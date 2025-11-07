export type LoggerMetadata = Record<string, unknown>;

export interface LoggerPort {
  debug(message: string, metadata?: LoggerMetadata): void;
  info(message: string, metadata?: LoggerMetadata): void;
  warn(message: string, metadata?: LoggerMetadata): void;
  error(message: string, metadata?: LoggerMetadata): void;
  child(bindings: LoggerMetadata): LoggerPort;
}
