import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check if user has roles array (many-to-many relationship)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((role: any) =>
        requiredRoles.includes(role.name) || requiredRoles.includes(role.code)
      );
    }

    // Fallback: check single role (for backward compatibility)
    if (user.role) {
      return requiredRoles.includes(user.role.name) || requiredRoles.includes(user.role.code);
    }

    return false;
  }
}
