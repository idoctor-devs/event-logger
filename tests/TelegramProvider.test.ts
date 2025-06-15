import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramProvider } from '../src/providers/telegram/TelegramProvider';
import { sendTelegramMessage } from '../src/utils/http';
import type { TelegramProviderConfig } from '../src/core/types';

vi.mock('../src/utils/http');
const mockSendTelegramMessage = vi.mocked(sendTelegramMessage);

// TelegramProvider
describe('TelegramProvider', () => {
  const validConfig: TelegramProviderConfig = {
    type: 'telegram',
    botToken: 'test-bot-token',
    chatId: 'test-chat-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Конструктор
  describe('constructor', () => {
    // Должен создать экземпляр с валидной конфигурацией
    it('should create instance with valid configuration', () => {
      const provider = new TelegramProvider(validConfig);

      expect(provider).toBeInstanceOf(TelegramProvider);
      expect(provider.getBotToken()).toBe(validConfig.botToken);
      expect(provider.getChatId()).toBe(validConfig.chatId);
    });

    // Должен создать экземпляр с необязательными параметрами
    it('should create instance with optional parameters', () => {
      const configWithOptions: TelegramProviderConfig = {
        ...validConfig,
        timeout: 10000,
        retryAttempts: 5,
      };

      const provider = new TelegramProvider(configWithOptions);

      expect(provider).toBeInstanceOf(TelegramProvider);
      expect(provider.getBotToken()).toBe(configWithOptions.botToken);
      expect(provider.getChatId()).toBe(configWithOptions.chatId);
    });
  });

  // getBotToken
  describe('getBotToken', () => {
    // Должен возвращать токен бота из конфигурации
    it('should return bot token from configuration', () => {
      const provider = new TelegramProvider(validConfig);

      expect(provider.getBotToken()).toBe(validConfig.botToken);
    });
  });

  // getChatId
  describe('getChatId', () => {
    // Должен возвращать ID чата из конфигурации
    it('should return chat ID from configuration', () => {
      const provider = new TelegramProvider(validConfig);

      expect(provider.getChatId()).toBe(validConfig.chatId);
    });
  });

  // Отправка
  describe('send', () => {
    // Должен успешно отправить сообщение
    it('should send message successfully', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const result = await provider.send('Test message', 'info');

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        validConfig.botToken,
        validConfig.chatId,
        expect.stringContaining('Test message'),
        {
          timeout: 5000,
          retryAttempts: 3,
        },
      );
    });

    // Должен использовать пользовательские таймаут и количество повторных попыток
    it('should use custom timeout and retry attempts', async () => {
      const configWithOptions: TelegramProviderConfig = {
        ...validConfig,
        timeout: 15000,
        retryAttempts: 7,
      };

      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(configWithOptions);

      const result = await provider.send('Test message', 'info');

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        configWithOptions.botToken,
        configWithOptions.chatId,
        expect.stringContaining('Test message'),
        {
          timeout: 15000,
          retryAttempts: 7,
        },
      );
    });

    // Должен форматировать сообщение с временной меткой и уровнем
    it('should format message with timestamp and level', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      await provider.send('Test message', 'error');

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];

      expect(formattedMessage).toContain('❌ [ERROR]');
      expect(formattedMessage).toContain('Test message');
      expect(formattedMessage).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}\.\d{2}\.\d{2}/); // Timestamp format
    });

    // Должен форматировать сообщение с метаданными
    it('should format message with metadata', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const metadata = {
        userId: 123,
        action: 'login',
        browser: 'Chrome',
      };

      await provider.send('User logged in', 'info', metadata);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];

      expect(formattedMessage).toContain('*METADATA*');
      expect(formattedMessage).toContain('*userId*: 123');
      expect(formattedMessage).toContain('*action*: login');
      expect(formattedMessage).toContain('*browser*: Chrome');
      expect(formattedMessage).toContain('User logged in');
    });

    // Должен использовать правильные эмодзи для разных уровней логирования
    it.each([
      { level: 'log' as const, emoji: '📝' },
      { level: 'info' as const, emoji: 'ℹ️' },
      { level: 'warn' as const, emoji: '⚠️' },
      { level: 'error' as const, emoji: '❌' },
    ])('should use correct emoji $emoji for $level level', async ({ level, emoji }) => {
      mockSendTelegramMessage.mockClear();
      mockSendTelegramMessage.mockResolvedValue(true);
      const provider = new TelegramProvider(validConfig);

      await provider.send('Test message', level);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];
      expect(formattedMessage).toContain(emoji);
      expect(formattedMessage).toContain(`[${level.toUpperCase()}]`);
    });

    // Должен обрабатывать пустое сообщение
    it('should handle empty message', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const result = await provider.send('', 'info');

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
    });

    // Должен обрабатывать сообщение только с метаданными
    it('should handle message with only metadata', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const metadata = { event: 'test' };
      const result = await provider.send('', 'info', metadata);

      expect(result).toBe(true);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];
      expect(formattedMessage).toContain('*METADATA*');
      expect(formattedMessage).toContain('*event*: test');
    });

    // Должен возвращать false когда sendTelegramMessage не срабатывает
    it('should return false when sendTelegramMessage fails', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(false);
      const provider = new TelegramProvider(validConfig);

      const result = await provider.send('Test message', 'info');

      expect(result).toBe(false);
    });

    // Должен обрабатывать исключения и возвращать false
    it('should handle exceptions and return false', async () => {
      mockSendTelegramMessage.mockRejectedValueOnce(new Error('Network error'));
      const provider = new TelegramProvider(validConfig);

      const result = await provider.send('Test message', 'info');

      expect(result).toBe(false);
    });

    // Должен обрабатывать смешанные типы метаданных
    it('should handle mixed metadata types', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const metadata = {
        stringValue: 'test',
        numberValue: 42,
        userId: 123,
      };

      await provider.send('Test message', 'info', metadata);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];

      expect(formattedMessage).toContain('*stringValue*: test');
      expect(formattedMessage).toContain('*numberValue*: 42');
      expect(formattedMessage).toContain('*userId*: 123');
    });

    // Должен правильно форматировать дату
    it('should format date correctly', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const mockDate = new Date('2023-12-25T10:30:45.123Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      await provider.send('Test message', 'info');

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];

      // Проверяем формат даты (учитывая возможную разницу в часовом поясе)
      expect(formattedMessage).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}\.\d{2}\.\d{2}/);
      expect(formattedMessage).toContain('25.12.2023');

      vi.restoreAllMocks();
    });

    // Должен обрабатывать очень длинные сообщения
    it('should handle very long messages', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const longMessage = 'A'.repeat(4000);
      const result = await provider.send(longMessage, 'info');

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        validConfig.botToken,
        validConfig.chatId,
        expect.stringContaining(longMessage),
        expect.any(Object),
      );
    });

    // Должен обрабатывать специальные символы в сообщении
    it('should handle special characters in message', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);
      const provider = new TelegramProvider(validConfig);

      const messageWithSpecialChars = 'Message with "quotes" and \n newlines';
      const result = await provider.send(messageWithSpecialChars, 'info');

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        validConfig.botToken,
        validConfig.chatId,
        expect.stringContaining(messageWithSpecialChars),
        expect.any(Object),
      );
    });
  });
});
