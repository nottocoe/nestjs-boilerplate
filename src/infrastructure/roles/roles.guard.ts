import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { ForbiddenError } from '@infrastructure/shared/exceptions/http-error';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.includes(user.roles);

    if (!hasRole) {
      throw new ForbiddenError(
        'AUTHENTICATION',
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
