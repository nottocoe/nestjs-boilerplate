import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ecsLogger } from '@config/logger.config';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Skip Health Check
    if (request.url === '/health' || request.url.includes('/health')) {
      return next.handle();
    }

    const response = ctx.getResponse<Response>();
    const start = Date.now();

    const isSse = () =>
      String(response.getHeader('Content-Type') ?? '').includes(
        'text/event-stream',
      );

    const logRequest = () => {
      const duration = Date.now() - start;

      ecsLogger.info({
        event: { action: 'http_request', duration },
        http: {
          method: request.method,
          url: request.url,
          status: response.statusCode,
        },
      });
    };

    // SSE connections emit repeatedly (heartbeats, live updates) for as long as
    // they stay open, so log once when the connection closes instead of per emission.
    return next.handle().pipe(
      tap(() => {
        if (!isSse()) logRequest();
      }),
      finalize(() => {
        if (isSse()) logRequest();
      }),
    );
  }
}
