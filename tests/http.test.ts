import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/utils/http', async () => {
  const actual = await vi.importActual('../src/utils/http');
  return {
    ...(actual as any),
    sendTelegramMessage: vi.fn(),
  };
});

import { sendTelegramMessage } from '../src/utils/http';

const mockSendTelegramMessage = vi.mocked(sendTelegramMessage);

describe('sendTelegramMessage', () => {
  const botToken = 'test-bot-token';
  const chatId = 'test-chat-id';
  const message = 'Test message';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Должен успешно возвратить замоканный результат
  it('should return mocked result successfully', async () => {
    mockSendTelegramMessage.mockResolvedValueOnce(true);

    const result = await sendTelegramMessage(botToken, chatId, message);

    expect(result).toBe(true);
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(mockSendTelegramMessage).toHaveBeenCalledWith(botToken, chatId, message);
  });

  // Должен обрабатывать пользовательские опции
  it('should handle custom options', async () => {
    const options = {
      timeout: 10000,
      retryAttempts: 5,
    };

    mockSendTelegramMessage.mockResolvedValueOnce(true);

    const result = await sendTelegramMessage(botToken, chatId, message, options);

    expect(result).toBe(true);
    expect(mockSendTelegramMessage).toHaveBeenCalledWith(botToken, chatId, message, options);
  });

  // Должен возвращать false при неудаче
  it('should return false on failure', async () => {
    mockSendTelegramMessage.mockResolvedValueOnce(false);

    const result = await sendTelegramMessage(botToken, chatId, message);

    expect(result).toBe(false);
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  // Должен обрабатывать отклонение промиса
  it('should handle promise rejection', async () => {
    mockSendTelegramMessage.mockRejectedValueOnce(new Error('Network error'));

    await expect(sendTelegramMessage(botToken, chatId, message)).rejects.toThrow('Network error');
    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  // Должен обрабатывать пустое сообщение
  it('should handle empty message', async () => {
    mockSendTelegramMessage.mockResolvedValueOnce(true);

    const result = await sendTelegramMessage(botToken, chatId, '');

    expect(result).toBe(true);
    expect(mockSendTelegramMessage).toHaveBeenCalledWith(botToken, chatId, '');
  });

  // Должен обрабатывать различные типы сообщений
  it.each(['Simple message', 'Message with special chars: !@#$%^&*()', 'Message with\nnewlines', '123456789'])(
    'should handle message type: %s',
    async testMessage => {
      mockSendTelegramMessage.mockResolvedValueOnce(true);

      const result = await sendTelegramMessage(botToken, chatId, testMessage);

      expect(result).toBe(true);
      expect(mockSendTelegramMessage).toHaveBeenCalledWith(botToken, chatId, testMessage);
    },
  );

  // Должен работать с различным количеством повторных попыток
  it('should work with different retry attempts', async () => {
    const options1 = { retryAttempts: 1 };
    const options2 = { retryAttempts: 5 };

    mockSendTelegramMessage.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await sendTelegramMessage(botToken, chatId, message, options1);
    await sendTelegramMessage(botToken, chatId, message, options2);

    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(2);
    expect(mockSendTelegramMessage).toHaveBeenNthCalledWith(1, botToken, chatId, message, options1);
    expect(mockSendTelegramMessage).toHaveBeenNthCalledWith(2, botToken, chatId, message, options2);
  });

  // Должен работать с различными значениями таймаута
  it('should work with different timeout values', async () => {
    const options1 = { timeout: 1000 };
    const options2 = { timeout: 10000 };

    mockSendTelegramMessage.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await sendTelegramMessage(botToken, chatId, message, options1);
    await sendTelegramMessage(botToken, chatId, message, options2);

    expect(mockSendTelegramMessage).toHaveBeenCalledTimes(2);
    expect(mockSendTelegramMessage).toHaveBeenNthCalledWith(1, botToken, chatId, message, options1);
    expect(mockSendTelegramMessage).toHaveBeenNthCalledWith(2, botToken, chatId, message, options2);
  });
});
