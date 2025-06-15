import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/utils/http', () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(true),
}));

import { EventLogger } from '../src/core/EventLogger';
import { ValidationError } from '../src/utils/validation';
import type { EventLoggerConfig } from '../src/core/types';

describe('EventLogger', () => {
  const validConfig: EventLoggerConfig = {
    environment: 'browser',
    providers: [
      {
        type: 'telegram',
        botToken: 'test-token',
        chatId: 'test-chat-id',
      },
    ],
  };

  // Должен создать экземпляр с валидной конфигурацией
  it('should create instance with valid configuration', () => {
    expect(() => new EventLogger(validConfig)).not.toThrow();
  });

  // Должен выбросить ValidationError с невалидной конфигурацией
  it('should throw ValidationError with invalid configuration', () => {
    const invalidConfig = {
      environment: 'invalid',
      providers: [],
    } as any;

    expect(() => new EventLogger(invalidConfig)).toThrow(ValidationError);
  });

  // Должен иметь все необходимые методы
  it('should have all required methods', () => {
    const logger = new EventLogger(validConfig);

    expect(typeof logger.log).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  // Должен корректно обрабатывать пустое сообщение
  it('should handle empty message gracefully', async () => {
    const logger = new EventLogger(validConfig);

    await expect(logger.log('')).resolves.toBeUndefined();
    await expect(logger.info('')).resolves.toBeUndefined();
    await expect(logger.warn('')).resolves.toBeUndefined();
    await expect(logger.error('')).resolves.toBeUndefined();
  });

  // Должен обрабатывать сообщения с метаданными
  it('should handle messages with metadata', async () => {
    const logger = new EventLogger(validConfig);
    const metadata = { userId: 123, action: 'test' };

    await expect(logger.log('Test message', metadata)).resolves.toBeUndefined();
    await expect(logger.info('Test message', metadata)).resolves.toBeUndefined();
    await expect(logger.warn('Test message', metadata)).resolves.toBeUndefined();
    await expect(logger.error('Test message', metadata)).resolves.toBeUndefined();
  });

  // Должен обрабатывать конфигурацию с несколькими провайдерами
  it('should handle configuration with multiple providers', () => {
    const configWithMultipleProviders: EventLoggerConfig = {
      environment: 'browser',
      providers: [
        {
          type: 'telegram',
          botToken: 'token-1',
          chatId: 'chat-1',
        },
        {
          type: 'telegram',
          botToken: 'token-2',
          chatId: 'chat-2',
        },
      ],
    };

    expect(() => new EventLogger(configWithMultipleProviders)).not.toThrow();
  });

  // Должен обрабатывать пользовательские настройки таймаута и повторных попыток
  it('should handle custom timeout and retry settings', () => {
    const configWithCustomSettings: EventLoggerConfig = {
      environment: 'browser',
      providers: [
        {
          type: 'telegram',
          botToken: 'test-token',
          chatId: 'test-chat-id',
          timeout: 10000,
          retryAttempts: 5,
        },
      ],
    };

    expect(() => new EventLogger(configWithCustomSettings)).not.toThrow();
  });

  // Должен обрабатывать очень длинные сообщения
  it('should handle very long messages', async () => {
    const logger = new EventLogger(validConfig);
    const longMessage = 'Very long message '.repeat(200);

    await expect(logger.log(longMessage)).resolves.toBeUndefined();
  });

  // Должен обрабатывать специальные символы в сообщениях
  it('should handle special characters in messages', async () => {
    const logger = new EventLogger(validConfig);
    const messageWithSpecialChars = 'Message with special chars: @#$%^&*()[]{}';

    await expect(logger.log(messageWithSpecialChars)).resolves.toBeUndefined();
  });

  // Должен обрабатывать конкурентные вызовы логирования
  it('should handle concurrent logging calls', async () => {
    const logger = new EventLogger(validConfig);

    const promises = [
      logger.log('Message 1'),
      logger.info('Message 2'),
      logger.warn('Message 3'),
      logger.error('Message 4'),
    ];

    await expect(Promise.all(promises)).resolves.toEqual([undefined, undefined, undefined, undefined]);
  });

  // Должен корректно обрабатывать null и undefined метаданные
  it('should handle null and undefined metadata gracefully', async () => {
    const logger = new EventLogger(validConfig);

    await expect(logger.log('Test message', undefined)).resolves.toBeUndefined();
    await expect(logger.info('Test message', null as any)).resolves.toBeUndefined();
  });

  // Должен обрабатывать пустой объект метаданных
  it('should handle empty metadata object', async () => {
    const logger = new EventLogger(validConfig);

    await expect(logger.log('Test message', {})).resolves.toBeUndefined();
  });
});
