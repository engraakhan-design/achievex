import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth.types';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    if (!required.length) return true;
    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!user || !required.every((permission) => user.permissions.includes(permission))) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
