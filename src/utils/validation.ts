import type { EventLoggerConfig, TelegramProviderConfig } from '../core/types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'ValidationError';
  }
}

export function validateEventLoggerConfig(config: EventLoggerConfig): void {
  if (!config) {
    throw new ValidationError('Configuration is required');
  }

  if (!config.environment) {
    throw new ValidationError('Environment is required');
  }

  if (config.environment !== 'browser') {
    throw new ValidationError('Only "browser" environment is supported');
  }

  if (!config.providers || !Array.isArray(config.providers)) {
    throw new ValidationError('Providers array is required');
  }

  if (config.providers.length === 0) {
    throw new ValidationError('At least one provider is required');
  }

  config.providers.forEach((provider, index) => {
    validateTelegramProviderConfig(provider, index);
  });
}

export function validateTelegramProviderConfig(config: TelegramProviderConfig, index?: number): void {
  const providerPrefix = index !== undefined ? `Provider[${index}]: ` : '';

  if (!config) {
    throw new ValidationError(`${providerPrefix}Provider configuration is required`);
  }

  if (config.type !== 'telegram') {
    throw new ValidationError(`${providerPrefix}Only "telegram" provider type is supported`);
  }

  if (!config.botToken || typeof config.botToken !== 'string') {
    throw new ValidationError(`${providerPrefix}Bot token is required and must be a string`);
  }

  if (!config.botToken.trim()) {
    throw new ValidationError(`${providerPrefix}Bot token cannot be empty`);
  }

  if (!config.chatId || typeof config.chatId !== 'string') {
    throw new ValidationError(`${providerPrefix}Chat ID is required and must be a string`);
  }

  if (!config.chatId.trim()) {
    throw new ValidationError(`${providerPrefix}Chat ID cannot be empty`);
  }

  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout <= 0) {
      throw new ValidationError(`${providerPrefix}Timeout must be a positive number`);
    }
  }

  if (config.retryAttempts !== undefined) {
    if (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0) {
      throw new ValidationError(`${providerPrefix}Retry attempts must be a non-negative number`);
    }
  }
}
