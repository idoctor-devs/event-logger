Надо добавить преттиер и еслинт

# Техническое задание: Event Logger

## Описание проекта

Event Logger - это NPM библиотека для отправки событий и сообщений в мессенджеры (изначально Telegram) из веб-приложений (SPA).

## Цели проекта

1. Предоставить простой API для отправки событий в Telegram чаты
2. Обеспечить расширяемость для добавления других мессенджеров в будущем
3. Гарантировать типобезопасность через TypeScript

## Требования

### Функциональные требования

#### 1. Основная функциональность
- Отправка текстовых сообщений в Telegram чаты с разными уровнями логирования
- Конфигурируемые настройки через параметры конструктора
- Простой API для логирования событий с уровнями: log, info, warn, error

#### 2. API
```typescript
// Создание экземпляра
const logger = new EventLogger(config);

// Отправка сообщений с разными уровнями
await logger.log(message);
await logger.info(message);
await logger.warn(message);
await logger.error(message);
```

#### 3. Конфигурация
- Массив провайдеров с их настройками
- Токен Telegram бота для каждого провайдера
- ID чата/канала для отправки сообщений
- Среда выполнения (browser)
- Опциональные настройки (таймауты, retry логика)

### Технические требования

#### 1. Платформа
- **Целевая среда**: Браузер (SPA приложения)
- **Будущая поддержка**: Node.js (в перспективе)

#### 2. Технологический стек
- **Язык**: TypeScript
- **Сборка**: Bundler (Vite)
- **Тестирование**: Vitest
- **Линтинг**: ESLint + Prettier

#### 3. Архитектура
- **Паттерн**: ООП с использованием классов
- **Типизация**: Строгая типизация TypeScript
- **Расширяемость**: Подготовка к добавлению других провайдеров

### Нефункциональные требования

#### 1. Производительность
- Минимальный размер бандла
- Асинхронные операции
- Обработка ошибок сети

#### 2. Надежность
- Retry механизм при неудачных отправках
- Graceful degradation при недоступности сервиса
- Валидация входных данных

#### 3. Безопасность
- Валидация токенов
- Защита от XSS при работе в браузере
- Не логировать чувствительные данные

## Структура проекта

```
event-logger/
├── src/
│   ├── core/
│   │   ├── EventLogger.ts          # Основной класс
│   │   ├── types.ts                # TypeScript типы
│   │   └── interfaces.ts           # Интерфейсы
│   ├── providers/
│   │   ├── base/
│   │   │   └── BaseProvider.ts     # Базовый класс провайдера
│   │   └── telegram/
│   │       └── TelegramProvider.ts # Telegram провайдер
│   ├── utils/
│   │   ├── http.ts                 # HTTP утилиты
│   │   └── validation.ts           # Валидация
│   └── index.ts                    # Точка входа
├── tests/
├── dist/                           # Собранные файлы
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## Детальное описание компонентов

### 1. EventLogger (Основной класс)

```typescript
type Environment = 'browser';
type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface TelegramProviderConfig {
  type: 'telegram';
  botToken: string;
  chatId: string;
  timeout?: number;
  retryAttempts?: number;
}

interface EventLoggerConfig {
  environment: Environment;
  providers: TelegramProviderConfig[];
}

interface IEventLogger {
  log(message: string): Promise<void>;
  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string): Promise<void>;
}

interface ITelegramProvider {
  send(message: string, level: LogLevel): Promise<boolean>;
  getBotToken(): string;
  getChatId(): string;
}

class EventLogger implements IEventLogger {
  constructor(config: EventLoggerConfig);

  async log(message: string): Promise<void>;
  async info(message: string): Promise<void>;
  async warn(message: string): Promise<void>;
  async error(message: string): Promise<void>;
}
```

### 2. Provider System

```typescript
interface IProvider {
  send(message: string, level: LogLevel): Promise<boolean>;
}

abstract class BaseProvider implements IProvider {
  abstract send(message: string, level: LogLevel): Promise<boolean>;
}

class TelegramProvider extends BaseProvider implements ITelegramProvider {
  constructor(config: TelegramProviderConfig);

  async send(message: string, level: LogLevel): Promise<boolean>;
  getBotToken(): string;
  getChatId(): string;
}
```

### 3. Типы

```typescript
type Environment = 'browser';
type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LogData {
  message: string;
  level: LogLevel;
  timestamp: Date;
  environment: Environment;
  metadata?: Record<string, any>;
}

interface TelegramProviderConfig {
  type: 'telegram';
  botToken: string;
  chatId: string;
  timeout?: number;
  retryAttempts?: number;
}

interface EventLoggerConfig {
  environment: Environment;
  providers: TelegramProviderConfig[];
}
```

## Этапы разработки

### Этап 1: MVP (Минимально жизнеспособный продукт)
- [ ] Создание основного класса EventLogger с интерфейсом IEventLogger
- [ ] Реализация TelegramProvider с интерфейсом ITelegramProvider
- [ ] Методы log(), info(), warn(), error()
- [ ] Строгая TypeScript типизация с отдельными интерфейсами
- [ ] Поддержка массива провайдеров в конфигурации
- [ ] Поддержка environment: 'browser'
- [ ] Сборка и публикация в NPM

### Этап 2: Улучшения
- [ ] Retry логика
- [ ] Обработка ошибок
- [ ] Валидация конфигурации
- [ ] Unit тесты

### Этап 3: Расширения
- [ ] Структурированные логи
- [ ] Документация и примеры

### Этап 4: Будущие возможности
- [ ] Поддержка дополнительных сред выполнения
- [ ] Дополнительные провайдеры (Discord, Slack)
- [ ] Батчинг сообщений
- [ ] Локальное кеширование

## Критерии готовности

### Критерии качества
1. Покрытие тестами > 80%
2. Нет TypeScript ошибок
3. Проходит линтинг
4. Работает в основных браузерах (Chrome, Firefox, Safari)
5. Строгая типизация всех компонентов
6. Корректная работа с массивом провайдеров

## Использование

### Установка
```bash
npm install event-logger
```

### Базовое использование
```typescript
import { EventLogger } from 'event-logger';

const logger = new EventLogger({
  environment: 'browser',
  providers: [
    {
      type: 'telegram',
      botToken: 'YOUR_BOT_TOKEN',
      chatId: 'YOUR_CHAT_ID',
      timeout: 5000,
      retryAttempts: 3
    }
  ]
});

// Отправка сообщений с разными уровнями
await logger.log('Regular log message');
await logger.info('Info message');
await logger.warn('Warning message');
await logger.error('Error message');
```

### Использование с несколькими провайдерами
```typescript
const logger = new EventLogger({
  environment: 'browser',
  providers: [
    {
      type: 'telegram',
      botToken: 'BOT_TOKEN_1',
      chatId: 'CHAT_ID_1'
    },
    {
      type: 'telegram',
      botToken: 'BOT_TOKEN_2',
      chatId: 'CHAT_ID_2'
    }
  ]
});
```

## Примечания

1. Все сетевые операции должны быть асинхронными
2. Библиотека не должна падать при ошибках сети
3. Конфигурация должна валидироваться при создании экземпляра
4. Подготовить архитектуру для легкого добавления новых провайдеров

## Ограничения текущей версии

1. Поддержка только браузерной среды
2. Только текстовые сообщения
3. Только Telegram провайдер
4. Нет персистентности сообщений