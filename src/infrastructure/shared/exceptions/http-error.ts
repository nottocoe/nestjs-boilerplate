import { BaseException } from './base.exception';

export class BadRequestError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 400);
  }
}

export class UnauthorizedError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 401);
  }
}

export class ForbiddenError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 403);
  }
}

export class NotFoundError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 404);
  }
}

export class InternalError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 500);
  }
}

export class ConflictError extends BaseException {
  constructor(domain: string, message: string) {
    super(domain, message, 409);
  }
}
