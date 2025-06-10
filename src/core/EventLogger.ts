import { IEventLogger } from './interfaces';
import { EventLoggerConfig, LogLevel } from './types';
import { TelegramProvider } from '../providers/telegram/TelegramProvider';
import { validateEventLoggerConfig } from '../utils/validation';

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

  async log(message: string): Promise<void> {
    await this.sendToAllProviders(message, 'log');
  }

  async info(message: string): Promise<void> {
    await this.sendToAllProviders(message, 'info');
  }

  async warn(message: string): Promise<void> {
    await this.sendToAllProviders(message, 'warn');
  }

  async error(message: string): Promise<void> {
    await this.sendToAllProviders(message, 'error');
  }

  private async sendToAllProviders(message: string, level: LogLevel): Promise<void> {
    if (!message || typeof message !== 'string') {
      console.warn('EventLogger: Message must be a non-empty string');
      return;
    }

    const sendPromises = this.providers.map(async (provider) => {
      try {
        await provider.send(message, level);
      } catch (error) {
        console.error(`EventLogger: Failed to send message via provider:`, error);
      }
    });

    await Promise.allSettled(sendPromises);
  }
}