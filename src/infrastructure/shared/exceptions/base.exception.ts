export abstract class BaseException extends Error {
  public readonly code: string;
  public readonly domain: string;
  public readonly statusCode: number;

  constructor(domain: string, message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.domain = domain ? domain : 'system';
    this.statusCode = statusCode;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}
