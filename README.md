# event-logger

Библиотека для логирования событий в SPA и отправки сообщений в мессенджеры (например, Telegram).

## Установка

```bash
npm install @idoctor-devs/event-logger
# или
yarn add @idoctor-devs/event-logger
# или
pnpm add @idoctor-devs/event-logger
```

## Быстрый старт

```ts
import { EventLogger } from '@idoctor-devs/event-logger';

const logger = new EventLogger({
  environment: 'browser',
  providers: [
    {
      type: 'telegram',
      botToken: 'ВАШ_TELEGRAM_BOT_TOKEN',
      chatId: 'ВАШ_CHAT_ID',
      // timeout: 5000, // (необязательно) таймаут в мс
      // retryAttempts: 3, // (необязательно) количество попыток при ошибке
    },
  ],
});

// Примеры логирования
logger.log('Обычное сообщение');
logger.info('Информационное сообщение', { userId: 123 });
logger.warn('Внимание!', { page: 'settings' });
logger.error('Ошибка!', { error: 'NetworkError' });
```

## Конфигурация

- **environment**: всегда `'browser'`
- **providers**: массив провайдеров (сейчас поддерживается только Telegram)
  - **type**: `'telegram'`
  - **botToken**: токен Telegram-бота (строка, обязателен)
  - **chatId**: ID чата или пользователя (строка, обязателен)
  - **timeout**: таймаут запроса (миллисекунды, необязательно)
  - **retryAttempts**: количество попыток при ошибке (необязательно)

## Примечания

- Все методы логирования (`log`, `info`, `warn`, `error`) асинхронные.
- Можно передавать дополнительную метаинформацию вторым аргументом.
- Для работы требуется корректно настроенный Telegram-бот и chatId.
