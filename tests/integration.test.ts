import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventLogger } from '../src/core/EventLogger';
import { ValidationError } from '../src/utils/validation';
import { sendTelegramMessage } from '../src/utils/http';
import type { EventLoggerConfig } from '../src/core/types';

vi.mock('../src/utils/http');
const mockSendTelegramMessage = vi.mocked(sendTelegramMessage);

// Интеграционные тесты
describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Полный поток EventLogger от начала до конца
  describe('EventLogger end-to-end flow', () => {
    // Должен успешно логировать сообщения через весь конвейер
    it('should successfully log messages through the entire pipeline', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
            timeout: 5000,
            retryAttempts: 3,
          },
        ],
      };

      const logger = new EventLogger(config);

      await logger.log('Test log message');
      await logger.info('Test info message');
      await logger.warn('Test warning message');
      await logger.error('Test error message');

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(4);

      const calls = mockSendTelegramMessage.mock.calls;
      expect(calls[0][2]).toContain('📝 [LOG]');
      expect(calls[1][2]).toContain('ℹ️ [INFO]');
      expect(calls[2][2]).toContain('⚠️ [WARN]');
      expect(calls[3][2]).toContain('❌ [ERROR]');
    });

    // Должен обрабатывать несколько провайдеров в конфигурации
    it('should handle multiple providers in configuration', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'bot-token-1',
            chatId: 'chat-id-1',
          },
          {
            type: 'telegram',
            botToken: 'bot-token-2',
            chatId: 'chat-id-2',
          },
        ],
      };

      const logger = new EventLogger(config);

      await logger.info('Test message');

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(2);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        'bot-token-1',
        'chat-id-1',
        expect.any(String),
        expect.any(Object),
      );
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(
        'bot-token-2',
        'chat-id-2',
        expect.any(String),
        expect.any(Object),
      );
    });

    // Должен корректно обрабатывать сбои провайдеров
    it('should handle provider failures gracefully', async () => {
      mockSendTelegramMessage.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'working-bot-token',
            chatId: 'working-chat-id',
          },
          {
            type: 'telegram',
            botToken: 'failing-bot-token',
            chatId: 'failing-chat-id',
          },
        ],
      };

      const logger = new EventLogger(config);

      await expect(logger.info('Test message')).resolves.toBeUndefined();

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(2);
    });

    // Должен корректно обрабатывать сетевые ошибки
    it('should handle network errors gracefully', async () => {
      mockSendTelegramMessage.mockRejectedValue(new Error('Network error'));

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
          },
        ],
      };

      const logger = new EventLogger(config);

      await expect(logger.error('Test error message')).resolves.toBeUndefined();

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
    });

    // Должен валидировать конфигурацию при инициализации
    it('should validate configuration on initialization', () => {
      const invalidConfig = {
        environment: 'invalid-environment',
        providers: [],
      } as any;

      expect(() => new EventLogger(invalidConfig)).toThrow(ValidationError);
    });

    // Должен обрабатывать сложные объекты метаданных
    it('should handle complex metadata objects', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
          },
        ],
      };

      const logger = new EventLogger(config);

      const complexMetadata = {
        userId: 12345,
        sessionId: 'session-abc-123',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: 1640995200,
        ipAddress: '192.168.1.1',
        action: 'user_login',
        success: 1,
        attempt: 1,
      };

      await logger.info('User login attempt', complexMetadata);

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];
      expect(formattedMessage).toContain('*METADATA*');
      expect(formattedMessage).toContain('*userId*: 12345');
      expect(formattedMessage).toContain('*sessionId*: session-abc-123');
      expect(formattedMessage).toContain('*action*: user_login');
    });

    // Должен обрабатывать пустые сообщения только с метаданными
    it('should handle empty messages with metadata only', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
          },
        ],
      };

      const logger = new EventLogger(config);

      await logger.info('', { event: 'page_view', page: '/dashboard' });

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);

      const formattedMessage = mockSendTelegramMessage.mock.calls[0][2];
      expect(formattedMessage).toContain('*event*: page_view');
      expect(formattedMessage).toContain('*page*: /dashboard');
    });

    // Должен обрабатывать конкурентные операции логирования
    it('should handle concurrent logging operations', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
          },
        ],
      };

      const logger = new EventLogger(config);

      const concurrentOperations = Array.from({ length: 10 }, (_, i) =>
        logger.info(`Concurrent message ${i}`, { messageId: i }),
      );

      await Promise.all(concurrentOperations);

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(10);
    });

    // Должен использовать правильные настройки таймаута и повторных попыток из конфигурации
    it('should use correct timeout and retry settings from configuration', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers: [
          {
            type: 'telegram',
            botToken: 'test-bot-token',
            chatId: 'test-chat-id',
            timeout: 15000,
            retryAttempts: 7,
          },
        ],
      };

      const logger = new EventLogger(config);

      await logger.info('Test message');

      expect(mockSendTelegramMessage).toHaveBeenCalledWith('test-bot-token', 'test-chat-id', expect.any(String), {
        timeout: 15000,
        retryAttempts: 7,
      });
    });

    // Должен обрабатывать большое количество провайдеров
    it('should handle large number of providers', async () => {
      mockSendTelegramMessage.mockResolvedValue(true);

      const providers = Array.from({ length: 5 }, (_, i) => ({
        type: 'telegram' as const,
        botToken: `bot-token-${i}`,
        chatId: `chat-id-${i}`,
      }));

      const config: EventLoggerConfig = {
        environment: 'browser',
        providers,
      };

      const logger = new EventLogger(config);

      await logger.info('Test message to multiple providers');

      expect(mockSendTelegramMessage).toHaveBeenCalledTimes(5);

      for (let i = 0; i < 5; i++) {
        expect(mockSendTelegramMessage).toHaveBeenCalledWith(
          `bot-token-${i}`,
          `chat-id-${i}`,
          expect.any(String),
          expect.any(Object),
        );
      }
    });
  });
});
