import { BaseProvider } from '../base/BaseProvider';
import { ITelegramProvider } from '../../core/interfaces';
import { LogLevel, TelegramProviderConfig } from '../../core/types';
import { sendTelegramMessage } from '../../utils/http';

export class TelegramProvider extends BaseProvider implements ITelegramProvider {
  private readonly config: TelegramProviderConfig;

  constructor(config: TelegramProviderConfig) {
    super();
    this.config = config;
  }

  async send(message: string, level: LogLevel): Promise<boolean> {
    try {
      const formattedMessage = this.formatMessage(message, level);

      const success = await sendTelegramMessage(
        this.config.botToken,
        this.config.chatId,
        formattedMessage,
        {
          timeout: this.config.timeout || 5000,
          retryAttempts: this.config.retryAttempts || 3,
        }
      );

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

  private formatMessage(message: string, level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const levelEmoji = this.getLevelEmoji(level);

    return `${levelEmoji} [${level.toUpperCase()}] ${timestamp}\n${message}`;
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