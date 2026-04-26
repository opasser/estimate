import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IConfirmDialogData } from '../types';
import { BalanceDialogComponent } from '../balance-dialog/balance-dialog.component';
import { DialogComponent } from '../dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);
  dialogStyle = {
    disableClose: true,
    autoFocus: false
  }

  constructor() { }

  showReject() {
    const dialogData: IConfirmDialogData = {
      title: 'Private session request',
      text: `Your request for a private session has been rejected.`,
      cancelButton: 'Cancel',
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = dialogData;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    return this.dialog.open(DialogComponent, dialogConfig)
      .componentInstance
      .confirmEmit
  }

  showBalance() {
    return this.dialog.open(BalanceDialogComponent)
  }

  showPrivateSessionRequest(perNickName: string) {
    const dialogData: IConfirmDialogData = {
      title: 'Private session request',
      text: `Would you like to send a request to ${perNickName} for a private session?`,
      cancelButton: 'Cancel',
      confirmButton: 'Confirm'
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = dialogData;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    return this.dialog.open(DialogComponent, dialogConfig)
      .componentInstance
      .confirmEmit
  }

  showPrivateSessionRequestAccept(memNickName: string) {
    const dialogData: IConfirmDialogData = {
      title: 'Private session request',
      text: `Member ${memNickName} requested a private session`,
      cancelButton: 'Reject',
      confirmButton: 'Accept'
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = dialogData;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    return this.dialog.open(DialogComponent, dialogConfig)
      .componentInstance
      .confirmEmit
  }

  multimediaWarning() {
    const dialogData: IConfirmDialogData = {
      title: 'No Access to Microphone or Camera warning',
      text: `Camera or microphone access denied or error occurred. Allow access media devices in browser settings and reload the page.`,
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = dialogData;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    return this.dialog.open(DialogComponent, dialogConfig);
  }

  leaveRoomConfirm() {
    const dialogData: IConfirmDialogData = {
      title: 'leave room dialog',
      text: `Are you sure you want to leave the private session? If confirmed, you will be redirected to the previous page.`,
      confirmButton: 'Confirm',
      cancelButton: 'Cancel',
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = dialogData;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    return this.dialog.open(DialogComponent, dialogConfig)
      .componentInstance
      .confirmEmit
   }
}
