
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const userRole = (user?.role || '').toUpperCase();

        // Support both exact match and includes (e.g. role = 'ADMIN' or 'ROLE_ADMIN')
        return requiredRoles.some((role) => userRole === role.toUpperCase() || userRole.includes(role.toUpperCase()));
    }
}
