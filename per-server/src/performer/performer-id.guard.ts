import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PerformerIdGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const paramId = req.params['id'];
    const [, token] = req.headers.authorization.split(' ');
    const { role, id } = this.jwtService.decode(token);

    if (role === 'performer' && Number(paramId) !== Number(id)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
