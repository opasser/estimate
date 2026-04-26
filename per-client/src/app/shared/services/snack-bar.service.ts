import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, status: string) {
    this._snackBar.open(message, 'Close', {
      verticalPosition: 'bottom',
      panelClass: `${status}-snackbar`,
      duration: 4000,
    });
  }
}

