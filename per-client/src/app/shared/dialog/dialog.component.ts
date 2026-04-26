import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IConfirmDialogData } from '../types';

@Component({
  selector: 'app-request-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  data: IConfirmDialogData  = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);

  @Output() confirmEmit: EventEmitter<boolean> = new EventEmitter;

  closeDialog() {
    this.confirmEmit.emit(false);
    this.dialogRef.close();
  }

  confirm() {
    this.confirmEmit.emit(true);
    this.dialogRef.close();
  }

  protected readonly Boolean = Boolean;
}

