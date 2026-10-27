import { HttpException, HttpStatus } from '@nestjs/common';
import { extractHttpExceptionInfo } from '@infrastructure/shared/helper/http-exception-info.helper';
import { BaseException } from '@infrastructure/shared/exceptions/base.exception';

class TestBaseException extends BaseException {
  constructor() {
    super('TEST_DOMAIN', 'base exception message', 422);
  }
}

describe('extractHttpExceptionInfo', () => {
  it('should extract status/code/message from a BaseException', () => {
    const exception = new TestBaseException();
    (exception as any).code = 'BASE_CODE';

    const result = extractHttpExceptionInfo(exception);

    expect(result).toEqual({
      status: 422,
      code: 'BASE_CODE',
      message: 'base exception message',
    });
  });

  it('should extract info from an HttpException with a string response', () => {
    const exception = new HttpException('plain string error', 400);

    const result = extractHttpExceptionInfo(exception);

    expect(result).toEqual({
      status: 400,
      code: 'HTTP_ERROR',
      message: 'plain string error',
    });
  });

  it('should extract info from an HttpException with an object response and array message', () => {
    const exception = new HttpException(
      { message: ['field must be a string', 'field is required'], error: 'Bad Request' },
      400,
    );

    const result = extractHttpExceptionInfo(exception);

    expect(result).toEqual({
      status: 400,
      code: 'Bad Request',
      message: 'field must be a string, field is required',
    });
  });

  it('should extract info from an HttpException with an object response and string message', () => {
    const exception = new HttpException(
      { message: 'single message', error: 'Forbidden' },
      403,
    );

    const result = extractHttpExceptionInfo(exception);

    expect(result).toEqual({
      status: 403,
      code: 'Forbidden',
      message: 'single message',
    });
  });

  it('should fall back to exception.message when the object response has no message field', () => {
    const exception = new HttpException({ error: 'Weird' }, 400);

    const result = extractHttpExceptionInfo(exception);

    expect(result.code).toBe('Weird');
    expect(result.message).toBe(exception.message);
  });

  it('should default code to HTTP_ERROR when the response has no error field', () => {
    const exception = new HttpException({ message: 'no error field' }, 400);

    const result = extractHttpExceptionInfo(exception);

    expect(result.code).toBe('HTTP_ERROR');
  });

  it('should extract info from a generic Error', () => {
    const exception = new Error('boom');

    const result = extractHttpExceptionInfo(exception);

    expect(result).toEqual({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'boom',
    });
  });

  it('should default the message for a generic Error with no message', () => {
    const exception = new Error('');

    const result = extractHttpExceptionInfo(exception);

    expect(result.message).toBe('Internal Server Error');
  });

  it('should extract info for a completely unknown thrown value', () => {
    const result = extractHttpExceptionInfo('just a string');

    expect(result).toEqual({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'UNKNOWN_ERROR',
      message: 'Internal Server Error',
    });
  });
});
