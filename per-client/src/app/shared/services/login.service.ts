import { Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ILogin, IToken } from '../types';

export const LOGIN_PATH = new InjectionToken<string>('LOGIN_PATH');

@Injectable()
export class LoginService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private loginPath = inject(LOGIN_PATH);
  private domainName = environment.domainName

  login$(login: ILogin) {
    return this.http.post<IToken>(`${this.domainName}/${this.loginPath}`, login)
      .pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error)),
        tap(({token}: IToken) => {
          this.authService.clearStorage();
          this.authService.setToken(token, this.authService.TOKEN_KEY)
        })
      );
  }
}
