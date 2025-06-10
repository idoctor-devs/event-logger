export type Environment = 'browser';
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

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
