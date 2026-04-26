import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MemberIdGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    try {
      const [ bearer, token ] = req.headers.authorization.split(' ');

      if (!token || bearer !== 'Bearer') {
        new UnauthorizedException();
      }

      const user = this.jwtService.verify(token) as { role: string[], exp: number, id: string, email: string } | null;
      return user.id === req.body.memberId

    } catch (error)  {
      console.error('RoleGuard => Error ', error);
      throw new UnauthorizedException();
    }
  }
}
