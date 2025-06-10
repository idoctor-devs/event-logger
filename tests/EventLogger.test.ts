import { describe, it, expect } from 'vitest';
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

  it('should create instance with valid configuration', () => {
    expect(() => new EventLogger(validConfig)).not.toThrow();
  });

  it('should throw ValidationError with invalid configuration', () => {
    const invalidConfig = {
      environment: 'invalid',
      providers: [],
    } as any;

    expect(() => new EventLogger(invalidConfig)).toThrow(ValidationError);
  });

  it('should have all required methods', () => {
    const logger = new EventLogger(validConfig);

    expect(typeof logger.log).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should handle empty message gracefully', async () => {
    const logger = new EventLogger(validConfig);

    // These should not throw errors
    await expect(logger.log('')).resolves.toBeUndefined();
    await expect(logger.info('')).resolves.toBeUndefined();
    await expect(logger.warn('')).resolves.toBeUndefined();
    await expect(logger.error('')).resolves.toBeUndefined();
  });
});