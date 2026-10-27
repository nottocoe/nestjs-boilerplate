import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { ecsLogger } from '@config/logger.config';
import { BaseException } from '@infrastructure/shared/exceptions/base.exception';
import { extractHttpExceptionInfo } from '@infrastructure/shared/helper/http-exception-info.helper';
import { DOMAIN } from '@infrastructure/shared/enums/core.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();

    const { status, code, message } = extractHttpExceptionInfo(exception);
    const domain =
      exception instanceof BaseException
        ? exception.domain
        : DOMAIN.SYSTEM;

    const errorBody = {
      domain,
      status,
      code,
      message,
      timestamp,
      path: request.url,
    };

    const logPayload = {
      event: { action: 'http_exception' },
      http: {
        method: request.method,
        url: request.url,
        status: status,
      },
      error: {
        code,
        message,
        stack:
          status >= 500 && exception instanceof Error
            ? exception.stack
            : undefined,
        detail: exception,
      },
    };

    if (status >= 500) {
      ecsLogger.error(logPayload);
    } else {
      ecsLogger.warn(logPayload);
    }

    response.status(status).json(errorBody);
  }
}
