import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.headers?.authorization) {
      throw new BadRequestException('Authorization does not provided.');
    }
    const user: any = JwtService.prototype.decode(request.headers.authorization.split(' ')[1], {
      complete: true,
    });
    return requiredRoles.some((role) => user.payload.roles?.includes(role));
  }
}