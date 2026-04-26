import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-balance-dialog',
  imports: [
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './balance-dialog.component.html',
  styleUrl: './balance-dialog.component.scss'
})
export class BalanceDialogComponent {
  private dialogRef = inject(MatDialogRef);
  tokensTopUp = environment.tokensTopUp

  closeDialog(): void {
    this.dialogRef.close();
  }
}
