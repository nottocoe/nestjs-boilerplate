import { HttpException, HttpStatus } from '@nestjs/common';
import { BaseException } from '@infrastructure/shared/exceptions/base.exception';

export interface HttpExceptionInfo {
  status: number;
  code: string | null;
  message: string;
}

interface HttpExceptionResponseBody {
  message?: string | string[];
  error?: string;
}

function isHttpExceptionResponseBody(
  value: unknown,
): value is HttpExceptionResponseBody {
  return typeof value === 'object' && value !== null;
}

export function extractHttpExceptionInfo(
  exception: unknown,
): HttpExceptionInfo {
  if (exception instanceof BaseException) {
    return {
      status: exception.statusCode,
      code: exception.code,
      message: exception.message,
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const res = exception.getResponse();
    const body = isHttpExceptionResponseBody(res) ? res : undefined;

    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : typeof res === 'string'
        ? res
        : body?.message || exception.message;

    return {
      status,
      code: body?.error || 'HTTP_ERROR',
      message,
    };
  }

  if (exception instanceof Error) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: exception.message || 'Internal Server Error',
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'UNKNOWN_ERROR',
    message: 'Internal Server Error',
  };
}
