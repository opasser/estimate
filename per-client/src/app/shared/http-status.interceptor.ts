import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest, HttpResponse
} from '@angular/common/http';
import { catchError, filter, map, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { SnackBarService } from './services/snack-bar.service';
import { AuthService } from './services/auth.service';

export function httpStatusInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const snackBarService = inject(SnackBarService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      snackBarService.openSnackBar(`${error.error.message}`, 'error')

      return throwError(() => error);
    }),
    filter((event: HttpEvent<unknown>) => event instanceof HttpResponse),
    map((event: HttpResponse<unknown>) => {
      const freshToken = event.headers.get('freshtoken');
      freshToken && authService.setToken(freshToken, authService.TOKEN_KEY);

      if (event.body && typeof event.body === 'object' && 'status' in event.body && 'message' in event.body) {
        snackBarService.openSnackBar(`${event.body.message}`, 'success');
      }

      return event;
    }),
  );
}
