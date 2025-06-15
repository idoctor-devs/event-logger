import { describe, it, expect } from 'vitest';
import { ValidationError, validateEventLoggerConfig, validateTelegramProviderConfig } from '../src/utils/validation';
import type { EventLoggerConfig, TelegramProviderConfig } from '../src/core/types';

// ValidationError
describe('ValidationError', () => {
  // Должен создать ValidationError с правильным именем и сообщением
  it('should create ValidationError with correct name and message', () => {
    const error = new ValidationError('Test error message');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test error message');
  });

  // Должен быть возможно выбросить и поймать
  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ValidationError('Test error');
    }).toThrow(ValidationError);
  });
});

// validateEventLoggerConfig
describe('validateEventLoggerConfig', () => {
  const validConfig: EventLoggerConfig = {
    environment: 'browser',
    providers: [
      {
        type: 'telegram',
        botToken: 'valid-token',
        chatId: 'valid-chat-id',
      },
    ],
  };

  // Должен пройти валидацию с валидной конфигурацией
  it('should pass validation with valid configuration', () => {
    expect(() => validateEventLoggerConfig(validConfig)).not.toThrow();
  });

  // Должен выбросить ValidationError когда config null
  it('should throw ValidationError when config is null', () => {
    expect(() => validateEventLoggerConfig(null as any)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(null as any)).toThrow('Configuration is required');
  });

  // Должен выбросить ValidationError когда config undefined
  it('should throw ValidationError when config is undefined', () => {
    expect(() => validateEventLoggerConfig(undefined as any)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(undefined as any)).toThrow('Configuration is required');
  });

  // Должен выбросить ValidationError когда environment отсутствует
  it('should throw ValidationError when environment is missing', () => {
    const config = { ...validConfig };
    delete (config as any).environment;

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('Environment is required');
  });

  // Должен выбросить ValidationError когда environment невалидно
  it('should throw ValidationError when environment is invalid', () => {
    const config = { ...validConfig, environment: 'invalid' as any };

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('Only "browser" environment is supported');
  });

  // Должен выбросить ValidationError когда providers отсутствуют
  it('should throw ValidationError when providers is missing', () => {
    const config = { ...validConfig };
    delete (config as any).providers;

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('Providers array is required');
  });

  // Должен выбросить ValidationError когда providers не массив
  it('should throw ValidationError when providers is not an array', () => {
    const config = { ...validConfig, providers: 'not-array' as any };

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('Providers array is required');
  });

  // Должен выбросить ValidationError когда массив providers пустой
  it('should throw ValidationError when providers array is empty', () => {
    const config = { ...validConfig, providers: [] };

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('At least one provider is required');
  });

  // Должен валидировать всех провайдеров в массиве
  it('should validate all providers in the array', () => {
    const config: EventLoggerConfig = {
      environment: 'browser',
      providers: [
        {
          type: 'telegram',
          botToken: 'valid-token',
          chatId: 'valid-chat-id',
        },
        {
          type: 'telegram',
          botToken: '',
          chatId: 'valid-chat-id',
        },
      ],
    };

    expect(() => validateEventLoggerConfig(config)).toThrow(ValidationError);
    expect(() => validateEventLoggerConfig(config)).toThrow('Provider[1]: Bot token is required and must be a string');
  });
});

// validateTelegramProviderConfig
describe('validateTelegramProviderConfig', () => {
  const validConfig: TelegramProviderConfig = {
    type: 'telegram',
    botToken: 'valid-token',
    chatId: 'valid-chat-id',
  };

  // Должен пройти валидацию с валидной конфигурацией
  it('should pass validation with valid configuration', () => {
    expect(() => validateTelegramProviderConfig(validConfig)).not.toThrow();
  });

  // Должен пройти валидацию с необязательными параметрами
  it('should pass validation with optional parameters', () => {
    const configWithOptionals: TelegramProviderConfig = {
      ...validConfig,
      timeout: 10000,
      retryAttempts: 5,
    };

    expect(() => validateTelegramProviderConfig(configWithOptionals)).not.toThrow();
  });

  // Должен выбросить ValidationError когда config null
  it('should throw ValidationError when config is null', () => {
    expect(() => validateTelegramProviderConfig(null as any)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(null as any)).toThrow('Provider configuration is required');
  });

  // Должен выбросить ValidationError когда config undefined
  it('should throw ValidationError when config is undefined', () => {
    expect(() => validateTelegramProviderConfig(undefined as any)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(undefined as any)).toThrow('Provider configuration is required');
  });

  // Должен включать индекс провайдера в сообщения об ошибках
  it('should include provider index in error messages', () => {
    expect(() => validateTelegramProviderConfig(null as any, 2)).toThrow(
      'Provider[2]: Provider configuration is required',
    );
  });

  // Должен выбросить ValidationError когда type не telegram
  it('should throw ValidationError when type is not telegram', () => {
    const config = { ...validConfig, type: 'discord' as any };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Only "telegram" provider type is supported');
  });

  // Должен выбросить ValidationError когда botToken отсутствует
  it('should throw ValidationError when botToken is missing', () => {
    const config = { ...validConfig };
    delete (config as any).botToken;

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Bot token is required and must be a string');
  });

  // Должен выбросить ValidationError когда botToken не является строкой
  it('should throw ValidationError when botToken is not a string', () => {
    const config = { ...validConfig, botToken: 123 as any };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Bot token is required and must be a string');
  });

  // Должен выбросить ValidationError когда botToken пустой
  it('should throw ValidationError when botToken is empty', () => {
    const config = { ...validConfig, botToken: '' };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Bot token is required and must be a string');
  });

  // Должен выбросить ValidationError когда botToken состоит только из пробелов
  it('should throw ValidationError when botToken is whitespace only', () => {
    const config = { ...validConfig, botToken: '   ' };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Bot token cannot be empty');
  });

  // Должен выбросить ValidationError когда chatId отсутствует
  it('should throw ValidationError when chatId is missing', () => {
    const config = { ...validConfig };
    delete (config as any).chatId;

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Chat ID is required and must be a string');
  });

  // Должен выбросить ValidationError когда chatId не является строкой
  it('should throw ValidationError when chatId is not a string', () => {
    const config = { ...validConfig, chatId: 123 as any };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Chat ID is required and must be a string');
  });

  // Должен выбросить ValidationError когда chatId пустой
  it('should throw ValidationError when chatId is empty', () => {
    const config = { ...validConfig, chatId: '' };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Chat ID is required and must be a string');
  });

  // Должен выбросить ValidationError когда chatId состоит только из пробелов
  it('should throw ValidationError when chatId is whitespace only', () => {
    const config = { ...validConfig, chatId: '   ' };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Chat ID cannot be empty');
  });

  // Должен выбросить ValidationError когда timeout не является положительным числом
  it('should throw ValidationError when timeout is not a positive number', () => {
    const config = { ...validConfig, timeout: -1000 };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Timeout must be a positive number');
  });

  // Должен выбросить ValidationError когда timeout равен нулю
  it('should throw ValidationError when timeout is zero', () => {
    const config = { ...validConfig, timeout: 0 };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Timeout must be a positive number');
  });

  // Должен выбросить ValidationError когда timeout не является числом
  it('should throw ValidationError when timeout is not a number', () => {
    const config = { ...validConfig, timeout: 'not-a-number' as any };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Timeout must be a positive number');
  });

  // Должен выбросить ValidationError когда retryAttempts отрицательное
  it('should throw ValidationError when retryAttempts is negative', () => {
    const config = { ...validConfig, retryAttempts: -1 };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Retry attempts must be a non-negative number');
  });

  // Должен выбросить ValidationError когда retryAttempts не является числом
  it('should throw ValidationError when retryAttempts is not a number', () => {
    const config = { ...validConfig, retryAttempts: 'not-a-number' as any };

    expect(() => validateTelegramProviderConfig(config)).toThrow(ValidationError);
    expect(() => validateTelegramProviderConfig(config)).toThrow('Retry attempts must be a non-negative number');
  });

  // Должен разрешать retryAttempts равным нулю
  it('should allow retryAttempts to be zero', () => {
    const config = { ...validConfig, retryAttempts: 0 };

    expect(() => validateTelegramProviderConfig(config)).not.toThrow();
  });
});
