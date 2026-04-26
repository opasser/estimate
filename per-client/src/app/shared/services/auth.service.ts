import { inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from './local-storage.service';
import { BehaviorSubject, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
import { CoinDecryptionService } from './coin-decryption.service';
import { IJwtPayload, IUserData, TRole } from '../types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private ADMIN: TRole = 'admin';
  private PERFORMER: TRole = 'performer';
  private MEMBER: TRole = 'member';
  private GUEST = 'guest';
  private USER_DATA = makeStateKey<string>('user-data');
  TOKEN_KEY = makeStateKey<string>('auth-token');
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private localStorage = inject(LocalStorageService);
  private coinDecryptionService = inject(CoinDecryptionService);
  private roleSubject$$ = new BehaviorSubject<string>(this.GUEST);

  role$() {
    return this.roleSubject$$.asObservable()
      .pipe(distinctUntilChanged())
  }

  getRole(token: string | null) {
    if(token) {
      const decoded = jwtDecode<IJwtPayload>(token);
      return decoded.role?.[0]
    } else {
      return this.GUEST
    }
  }


  getPerformer(): IJwtPayload {
    const token = this.getToken(this.TOKEN_KEY);
    return token && this.isAuthPerformer ? jwtDecode(token) : {} as IJwtPayload;
  }

  getMember(): IJwtPayload {
    const token = this.getToken(this.TOKEN_KEY);
    return token && this.isAuthMember ? jwtDecode(token) : {} as IJwtPayload;
  }

  private isAuth(role: TRole): boolean {
    try {
      const token = this.getToken(this.TOKEN_KEY);
      if (!token) {
        return false;
      }

      const decoded: IJwtPayload = jwtDecode(token);

      if (!decoded.exp) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime && decoded.role.includes(role);
    } catch (error) {
      this.clearStorage();
      return false;
    }
  }

  get isAuthMember() {
    return this.isAuth(this.MEMBER);
  }

  get isAuthAdmin() {
    return this.isAuth(this.ADMIN);
  }

  get isAuthPerformer(): boolean {
    return this.isAuth(this.PERFORMER);
  }

  get isBrowser(){
    return isPlatformBrowser(this.platformId);
  }

  get isServer(){
    return isPlatformServer(this.platformId);
  }

  get isAuthUser() {
    return Boolean(this.getToken(this.TOKEN_KEY));
  }

  setUserData(userdata: IUserData) {
    this.userData$$.next(userdata);
    if (this.isServer) {
      this.transferState.set(this.TOKEN_KEY, JSON.stringify(userdata));
    } else if (this.isBrowser) {
      this.localStorage.setItem(this.USER_DATA, JSON.stringify(userdata));
    }
  }

  getUserData() {
    if (this.isServer) {
      const userData = this.transferState.get(this.USER_DATA, null);
      return userData ? JSON.parse(userData) : null
    } else if (this.isBrowser) {
      const userData = this.localStorage.getItem(this.USER_DATA);
      return userData ? JSON.parse(userData) : null
    }
  }

  private userData$$ = new BehaviorSubject<IUserData | null>(this.getUserData())
  getTokensAmount$(): Observable<string> {
    return this.userData$$.asObservable()
      .pipe(
        distinctUntilChanged(),
        filter(Boolean),
        switchMap((userData) => this.coinDecryptionService.decrypt$(userData))
      );
  }

  setToken(token: string, tokenKey: StateKey<string>): void {
    this.roleSubject$$.next(this.getRole(token))

    if (this.isServer) {
      this.transferState.set(tokenKey, token);
    } else if (this.isBrowser) {
      this.localStorage.setItem(tokenKey, token);
    }
  }

  getToken(tokenKey: StateKey<string>): string | null {
    let token: string | null = null;

    if (this.isServer) {
      token = this.transferState.get(tokenKey, null);
    } else if (this.isBrowser) {
      token = this.localStorage.getItem(tokenKey);
    }

    this.roleSubject$$.next(this.getRole(token));

    return token;
  }

  clearStorage(): void {
    this.userData$$.next(null)
    this.localStorage.clear()
  }

  removeToken(): void {
    if (this.isBrowser) {
      this.localStorage.removeItem(this.TOKEN_KEY);
    }

    if (this.isServer) {
      this.transferState.remove(this.TOKEN_KEY);
    }
  }
}

