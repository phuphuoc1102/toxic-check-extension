import { errorCodes, IError } from './error';

export class Exception extends Error {
  code: string;
  message: string;
  constructor(errorKey: string) {
    const error = errorCodes[errorKey];
    super(error.message);
    this.code = error.code;
  }
}

export function isMyError(error: unknown): error is IError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}
