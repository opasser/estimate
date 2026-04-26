import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CryptService } from '../../crypt/crypt.service';
import { JwtService } from '@nestjs/jwt';
import { IParsedTokenData } from '../entity.abstract.service';

@Injectable()
@Injectable()
export class TokenRefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token || token === 'null') {
      return true;
    }

    try {
      const decoded: IParsedTokenData = this.jwtService.decode(token);

      if (!decoded) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp > currentTime) {
        const payload = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          nickName: decoded.nickName,
        };

        const tokenData = await this.cryptService.makeToken(payload);
        const response = context.switchToHttp().getResponse();
        const FRESH_TOKEN = 'Freshtoken';
        response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Expires', '0');
        response.setHeader('Access-Control-Expose-Headers', FRESH_TOKEN);
        response.setHeader(FRESH_TOKEN, `${tokenData.token}`);
      }

      return true;
    } catch (error) {
      console.error('TokenRefreshGuard => Fresh token error:', error);
      return true;
    }
  }
}
