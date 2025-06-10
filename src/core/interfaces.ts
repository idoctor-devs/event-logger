import type { LogLevel } from './types';

export interface IEventLogger {
  log(message: string, metadata?: Record<string, string | number>): Promise<void>;
  info(message: string, metadata?: Record<string, string | number>): Promise<void>;
  warn(message: string, metadata?: Record<string, string | number>): Promise<void>;
  error(message: string, metadata?: Record<string, string | number>): Promise<void>;
}

export interface IProvider {
  send(message: string, level: LogLevel, metadata?: Record<string, string | number>): Promise<boolean>;
}

export interface ITelegramProvider extends IProvider {
  send(message: string, level: LogLevel, metadata?: Record<string, string | number>): Promise<boolean>;
  getBotToken(): string;
  getChatId(): string;
}
