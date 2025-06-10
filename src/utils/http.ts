interface TelegramSendOptions {
  timeout?: number;
  retryAttempts?: number;
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  options: TelegramSendOptions = {},
): Promise<boolean> {
  const { timeout = 5000, retryAttempts = 3 } = options;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML' as const,
  };

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      }

      const errorData = await response.json().catch(() => ({}));
      console.warn(`Telegram API error (attempt ${attempt}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (attempt === retryAttempts) {
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    } catch (error) {
      console.warn(`Network error (attempt ${attempt}):`, error);

      if (attempt === retryAttempts) {
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return false;
}
