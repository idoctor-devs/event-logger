import { TelegramProvider } from '../providers/telegram/TelegramProvider';
import { validateEventLoggerConfig } from '../utils/validation';

import type { IEventLogger } from './interfaces';
import type { EventLoggerConfig, LogLevel } from './types';

export class EventLogger implements IEventLogger {
  private readonly providers: TelegramProvider[] = [];
  private readonly config: EventLoggerConfig;

  constructor(config: EventLoggerConfig) {
    validateEventLoggerConfig(config);
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      if (providerConfig.type === 'telegram') {
        const provider = new TelegramProvider(providerConfig);
        this.providers.push(provider);
      }
    }
  }

  async log(message: string, metadata?: Record<string, string | number>): Promise<void> {
    await this.sendToAllProviders(message, 'log', metadata);
  }

  async info(message: string, metadata?: Record<string, string | number>): Promise<void> {
    await this.sendToAllProviders(message, 'info', metadata);
  }

  async warn(message: string, metadata?: Record<string, string | number>): Promise<void> {
    await this.sendToAllProviders(message, 'warn', metadata);
  }

  async error(message: string, metadata?: Record<string, string | number>): Promise<void> {
    await this.sendToAllProviders(message, 'error', metadata);
  }

  private async sendToAllProviders(message: string, level: LogLevel, metadata?: Record<string, string | number>): Promise<void> {
    if (!message || typeof message !== 'string') {
      console.warn('EventLogger: Message must be a non-empty string');
      return;
    }

    const sendPromises = this.providers.map(async provider => {
      try {
        await provider.send(message, level, metadata);
      } catch (error) {
        console.error(`EventLogger: Failed to send message via provider:`, error);
      }
    });

    await Promise.allSettled(sendPromises);
  }
}
