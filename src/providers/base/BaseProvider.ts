import { IProvider } from '../../core/interfaces';
import { LogLevel } from '../../core/types';

export abstract class BaseProvider implements IProvider {
  abstract send(message: string, level: LogLevel): Promise<boolean>;
}