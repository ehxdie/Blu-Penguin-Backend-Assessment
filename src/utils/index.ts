import { environment } from '../config';

export function isDevEnvironment(): boolean {
  const nodeEnv = environment;
  return nodeEnv === 'development';
}
