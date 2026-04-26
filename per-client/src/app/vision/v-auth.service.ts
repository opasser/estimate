import { Injectable, makeStateKey } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { visionEnvironment } from './environment.vision';

@Injectable({
  providedIn: 'root'
})
export class VAuthService extends AuthService {
  VISION_TOKEN_KEY = makeStateKey<string>('vision-auth-token')
  VISION_GUEST_NICKNAME = visionEnvironment.guestNickname;
  VISION_GUEST_ID = visionEnvironment.guestId;

  get isAuthVision(): boolean {
    const token = this.getToken(this.VISION_TOKEN_KEY);
    if (!token) return false;

    const { exp } = jwtDecode(token) || {};
    if (!exp) return false;

    return this.isTokenValid(exp);
  }

  get isVisionGuestAuth() {
    const token = this.getToken(this.VISION_TOKEN_KEY);
    if (!token) return false;

    const { nickname, exp } = jwtDecode<{ nickname: string; exp: number }>(token);
    return nickname === this.VISION_GUEST_NICKNAME && this.isTokenValid(exp);
  }

  get isVisionMemberAuth() {
    const token = this.getToken(this.VISION_TOKEN_KEY);
    if (!token) return false;

    const { nickname, exp } = jwtDecode<{ nickname: string; exp: number }>(token);
    return nickname !== this.VISION_GUEST_NICKNAME && this.isTokenValid(exp);
  }

  private isTokenValid(exp: number) {
    if (!exp) return false;
    const bufferTimeMs = 10 * 60 * 1000;

    return new Date((exp * 1000) - bufferTimeMs) > new Date(Date.now());
  }
}
