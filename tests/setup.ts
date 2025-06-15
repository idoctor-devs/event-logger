import { vi } from 'vitest';

vi.mock('../src/utils/http', () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(true),
}));

global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
};
