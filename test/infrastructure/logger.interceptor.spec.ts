import { of, Subject } from 'rxjs';
import { LoggerInterceptor } from '@infrastructure/interceptor/logger.interceptor';
import { ecsLogger } from '@config/logger.config';

jest.mock('@config/logger.config', () => ({
  ecsLogger: { info: jest.fn() },
}));

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;

  const buildContext = (
    request: Record<string, unknown>,
    headers: Record<string, string> = {},
  ) => {
    const response = {
      statusCode: 200,
      getHeader: (name: string) => headers[name],
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as any;
  };

  const buildNext = (observable: any) => ({
    handle: () => observable,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips health check requests entirely', (done) => {
    const context = buildContext({ url: '/health', method: 'GET' });
    const source$ = of('ok');

    interceptor = new LoggerInterceptor();
    interceptor.intercept(context, buildNext(source$)).subscribe({
      complete: () => {
        expect(ecsLogger.info).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('logs once for a regular request that emits a single value', (done) => {
    const context = buildContext({ url: '/vms/setting/list', method: 'GET' });
    const source$ = of({ ok: true });

    interceptor = new LoggerInterceptor();
    interceptor.intercept(context, buildNext(source$)).subscribe({
      complete: () => {
        expect(ecsLogger.info).toHaveBeenCalledTimes(1);
        expect(ecsLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            event: expect.objectContaining({ action: 'http_request' }),
            http: expect.objectContaining({
              method: 'GET',
              url: '/vms/setting/list',
              status: 200,
            }),
          }),
        );
        done();
      },
    });
  });

  it('logs once on close for an SSE stream, not once per emission', (done) => {
    const context = buildContext(
      { url: '/streaming/vms', method: 'GET' },
      { 'Content-Type': 'text/event-stream' },
    );

    const subject = new Subject();
    interceptor = new LoggerInterceptor();

    let nextCount = 0;
    interceptor.intercept(context, buildNext(subject)).subscribe({
      next: () => {
        nextCount += 1;
      },
    });

    subject.next({ type: 'vms_init', data: {} });
    subject.next({ type: 'heartbeat', data: {} });
    subject.next({ type: 'heartbeat', data: {} });
    subject.complete();

    // finalize()'s teardown callback runs after complete() finishes propagating,
    // so assert on the next tick rather than inside a completion handler.
    setImmediate(() => {
      try {
        expect(nextCount).toBe(3);
        expect(ecsLogger.info).toHaveBeenCalledTimes(1);
        expect(ecsLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            http: expect.objectContaining({ url: '/streaming/vms' }),
          }),
        );
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
