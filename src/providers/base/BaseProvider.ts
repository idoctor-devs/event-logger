import type { IProvider } from '../../core/interfaces';
import type { LogLevel } from '../../core/types';

export abstract class BaseProvider implements IProvider {
  abstract send(message: string, level: LogLevel, metadata?: Record<string, string | number>): Promise<boolean>;
}
