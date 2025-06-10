export type Environment = 'browser';
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface LogData {
  message: string;
  level: LogLevel;
  timestamp: Date;
  environment: Environment;
  metadata?: Record<string, any>;
}

export interface TelegramProviderConfig {
  type: 'telegram';
  botToken: string;
  chatId: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface EventLoggerConfig {
  environment: Environment;
  providers: TelegramProviderConfig[];
}