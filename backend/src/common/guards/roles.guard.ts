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

    console.log('--- RolesGuard Debug Start ---');
    console.log('Request Path:', context.switchToHttp().getRequest().url);
    console.log('Required Roles:', requiredRoles);
    console.log('User Payload:', JSON.stringify(user));

    if (!user) {
      console.log('Result: DENIED - No user in request');
      console.log('--- RolesGuard Debug End ---');
      return false;
    }

    const checkRole = (role: any): boolean => {
      const name = typeof role === 'string' ? role : role?.name;
      const code = typeof role === 'string' ? role : role?.code;

      const isMatch = requiredRoles.includes(name) ||
        requiredRoles.includes(code) ||
        // Backward compatibility / synonym mapping
        (requiredRoles.includes('OWNER') && (name === 'Admin' || name === 'Owner' || code === 'ADMIN' || code === 'Admin'));

      console.log(`Checking role [Name: ${name}, Code: ${code}] against ${requiredRoles} -> Match: ${isMatch}`);
      return isMatch;
    };

    // Check if user has roles array (many-to-many relationship)
    if (user.roles && Array.isArray(user.roles)) {
      console.log('Found user.roles array');
      const hasRole = user.roles.some((role: any) => checkRole(role));
      console.log('Result:', hasRole ? 'ALLOWED' : 'DENIED');
      console.log('--- RolesGuard Debug End ---');
      return hasRole;
    }

    // Fallback: check single role (for backward compatibility)
    if (user.role) {
      console.log('Found user.role singular');
      const hasRole = checkRole(user.role);
      console.log('Result:', hasRole ? 'ALLOWED' : 'DENIED');
      console.log('--- RolesGuard Debug End ---');
      return hasRole;
    }

    console.log('Result: DENIED - No roles found in user object');
    console.log('--- RolesGuard Debug End ---');
    return false;
  }
}
