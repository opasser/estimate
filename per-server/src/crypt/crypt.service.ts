import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { IPayload } from '../shared/entity.abstract.service';
import { createCipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface IEncryptCoins {
  userId: string;
  height: string;
  width: string;
}

@Injectable()
export class CryptService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getHashedPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async makeToken(payload: IPayload) {
    return { token: this.jwtService.sign(payload) };
  }

  async compare(dtoPass: string, adminPass: string) {
    return bcrypt.compare(dtoPass, adminPass);
  }

  async encryptCoins(amount: number) {
    const KEY = Buffer.from(this.configService.get<string>('COINS_ENCRYPT_KEY'), 'utf-8');
    const IV = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', KEY, IV);
    let encrypted = cipher.update(amount.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      userId: encrypted,
      height: IV.toString('hex'),
      width: authTag
    } as IEncryptCoins;
  }
}
