import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const Role = (...roles: string[]) => SetMetadata('roleNames', roles);

@Injectable()
export class RoleGuard implements CanActivate {
  roles!: string[];

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    this.roles =  this.reflector.get<string[]>('roleNames', context.getHandler()) ??
      this.reflector.get<string[]>('roleNames', context.getClass());

    const req = context.switchToHttp().getRequest();

    try {
      if (!req.headers.authorization) {
        this.throwUnauthorizedException();
      }

      const [ bearer, token ] = req.headers.authorization.split(' ');

      if (!token || bearer !== 'Bearer') {
        this.throwUnauthorizedException();
      }

      const user = this.jwtService.verify(token) as { role: string[], exp: number, id: string, email: string } | null;

      return this.roles.includes(user.role[0]);
    } catch (error) {
        console.error('RoleGuard => Error ', error);
        this.throwUnauthorizedException();
    }
  }

  private throwUnauthorizedException(): never {
    throw new UnauthorizedException();
  }
}
