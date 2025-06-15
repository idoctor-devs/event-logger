import { describe, it, expect } from 'vitest';
import { BaseProvider } from '../src/providers/base/BaseProvider';
import type { LogLevel } from '../src/core/types';

class TestProvider extends BaseProvider {
  private shouldSucceed: boolean;

  constructor(shouldSucceed = true) {
    super();
    this.shouldSucceed = shouldSucceed;
  }

  async send(message: string, _level: LogLevel, metadata?: Record<string, string | number>): Promise<boolean> {
    if (!this.shouldSucceed) {
      return false;
    }

    if (!message && (!metadata || Object.keys(metadata).length === 0)) {
      return false;
    }

    return true;
  }
}

describe('BaseProvider', () => {
  // Абстрактная реализация
  describe('abstract implementation', () => {
    // Должен быть расширяемым конкретными провайдерами
    it('should be extendable by concrete providers', () => {
      const provider = new TestProvider();

      expect(provider).toBeInstanceOf(BaseProvider);
      expect(typeof provider.send).toBe('function');
    });

    // Должен иметь метод send с правильной сигнатурой
    it('should have send method with correct signature', async () => {
      const provider = new TestProvider();

      const result = await provider.send('Test message', 'info');

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    // Должен обрабатывать все уровни логирования
    it.each(['log' as const, 'info' as const, 'warn' as const, 'error' as const])(
      'should handle %s log level',
      async level => {
        const provider = new TestProvider();

        const result = await provider.send('Test message', level);
        expect(result).toBe(true);
      },
    );

    // Должен обрабатывать параметр metadata
    it('should handle metadata parameter', async () => {
      const provider = new TestProvider();

      const metadata = {
        userId: 123,
        action: 'test',
      };

      const result = await provider.send('Test message', 'info', metadata);

      expect(result).toBe(true);
    });

    // Должен обрабатывать отсутствие параметра metadata
    it('should handle missing metadata parameter', async () => {
      const provider = new TestProvider();

      const result = await provider.send('Test message', 'info');

      expect(result).toBe(true);
    });

    // Должен обрабатывать пустое сообщение с метаданными
    it('should handle empty message with metadata', async () => {
      const provider = new TestProvider();

      const metadata = { event: 'test' };
      const result = await provider.send('', 'info', metadata);

      expect(result).toBe(true);
    });

    // Должен возвращать false при пустом сообщении без метаданных
    it('should return false for empty message without metadata', async () => {
      const provider = new TestProvider();

      const result = await provider.send('', 'info');

      expect(result).toBe(false);
    });

    // Должен обрабатывать различные типы сообщений
    it.each([
      'Simple message',
      'Message with special chars: !@#$%^&*()',
      'Message with\nnewlines',
      'Very long message '.repeat(100),
      '123456789',
      'Message with "quotes" and \'apostrophes\'',
    ])('should handle message: %s', async message => {
      const provider = new TestProvider();

      const result = await provider.send(message, 'info');
      expect(result).toBe(true);
    });

    // Должен обрабатывать различные комбинации метаданных
    it('should handle various metadata combinations', async () => {
      const provider = new TestProvider();

      const result1 = await provider.send('Test message', 'info', { key: 'value' });
      expect(result1).toBe(true);

      const result2 = await provider.send('Test message', 'info', { num: 123 });
      expect(result2).toBe(true);

      const result3 = await provider.send('Test message', 'info', { multiple: 'values', count: 42 });
      expect(result3).toBe(true);

      const result4 = await provider.send('Test message', 'info', { empty: '' });
      expect(result4).toBe(true);

      const result5 = await provider.send('Test message', 'info', { zero: 0 });
      expect(result5).toBe(true);
    });
  });

  // Соответствие интерфейсу
  describe('interface compliance', () => {
    // Должен реализовывать интерфейс IProvider
    it('should implement IProvider interface', () => {
      const provider = new TestProvider();

      expect(provider.send).toBeDefined();
      expect(typeof provider.send).toBe('function');
    });

    // Должен возвращать Promise<boolean> из метода send
    it('should return Promise<boolean> from send method', async () => {
      const provider = new TestProvider();

      const result = provider.send('Test message', 'info');

      expect(result).toBeInstanceOf(Promise);

      const resolved = await result;
      expect(typeof resolved).toBe('boolean');
    });
  });
});
