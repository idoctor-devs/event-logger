import type { ITelegramProvider } from '../../core/interfaces';
import type { LogLevel, TelegramProviderConfig } from '../../core/types';
import { sendTelegramMessage } from '../../utils/http';
import { BaseProvider } from '../base/BaseProvider';

export class TelegramProvider extends BaseProvider implements ITelegramProvider {
  private readonly config: TelegramProviderConfig;

  constructor(config: TelegramProviderConfig) {
    super();
    this.config = config;
  }

  async send(message: string, level: LogLevel, metadata?: Record<string, string | number>): Promise<boolean> {
    try {
      const formattedMessage = this.formatMessage(message, level, metadata);

      const success = await sendTelegramMessage(this.config.botToken, this.config.chatId, formattedMessage, {
        timeout: this.config.timeout || 5000,
        retryAttempts: this.config.retryAttempts || 3,
      });

      return success;
    } catch (error) {
      console.error('TelegramProvider send error:', error);

      return false;
    }
  }

  getBotToken(): string {
    return this.config.botToken;
  }

  getChatId(): string {
    return this.config.chatId;
  }

  private formatMessage(message: string, level: LogLevel, metadata?: Record<string, string | number>): string {
    const timestamp = new Date().toISOString();
    const levelEmoji = this.getLevelEmoji(level);

    let formattedMessage = `${levelEmoji} [${level.toUpperCase()}] ${timestamp}`;

    if (metadata && Object.keys(metadata).length > 0) {
      formattedMessage += '\n\n*-- metadata --*';
      for (const [key, value] of Object.entries(metadata)) {
        formattedMessage += `\n*${key}*: ${value}`;
      }
      formattedMessage += '\n';
    }

    formattedMessage += `\n${message}`;

    return formattedMessage;
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojiMap = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };

    return emojiMap[level];
  }
}
