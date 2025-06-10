import { LogLevel } from './types';

export interface IEventLogger {
  log(message: string): Promise<void>;
  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string): Promise<void>;
}

export interface IProvider {
  send(message: string, level: LogLevel): Promise<boolean>;
}

export interface ITelegramProvider extends IProvider {
  send(message: string, level: LogLevel): Promise<boolean>;
  getBotToken(): string;
  getChatId(): string;
}