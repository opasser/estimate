import { ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, from, switchMap, take, tap, timer } from 'rxjs';
import {
  IDataPayload,
  IEmitMessage,
  IMessage,
  IPrivateRoomData,
  IPrivateRoomParticipant, ITips, TPaymentsType,
} from '../shared/types';
import { StreamService } from '../shared/services/stream.service';
import { PrivateRtcAdaptorService } from './private-rtc-adaptor.service';
import { DialogService } from '../shared/services/dialog.service';
import { ChatComponent } from '../chat/chat.component';
import { ChatService } from '../chat/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentsService } from '../shared/services/payments.service';
import { PAY_API_URL } from '../admin/service/payments-table.service';
import { SelectMediaDevicesComponent } from '../shared/select-media-devices/select-media-devices.component';
import { ToggleMenuDirective } from '../shared/toggle-menu.directive';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';

@Component({
  selector: 'app-private-room',
  imports: [FormsModule, ChatComponent, SelectMediaDevicesComponent, ToggleMenuDirective, ToggleButtonComponent],
  providers: [
    PrivateRtcAdaptorService,
    { provide: PAY_API_URL, useValue: 'payment'},
    PaymentsService
  ],
  templateUrl: './private-room.component.html',
  styleUrl: './private-room.component.scss'
})
export class PrivateRoomComponent implements OnInit {
  private streamService = inject(StreamService);
  private chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  dialogService = inject(DialogService);
  privateRtcAdaptorService = inject(PrivateRtcAdaptorService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  prd!: Required<IPrivateRoomData>;
  participant!: IPrivateRoomParticipant;
  messages: IMessage[] = [];
  coinsArr = [1, 2, 5, 10, 20, 50];
  private paymentService = inject(PaymentsService);

  @ViewChild('players') players!: ElementRef;
  @ViewChild('privateRemoteVideo') remoteVideo!: ElementRef;

  ngOnInit() {
    this.prd = this.route.snapshot.data['privateRoomData'];
    this.participant = this.prd.participant;

    from(this.privateRtcAdaptorService.runWebcam())
      .pipe(
        switchMap(() => timer(this.participant.role === 'performer' ? 1500 : 2000)
          .pipe(
            tap(() => this.privateRtcAdaptorService.joinRoom(this.prd, this.remoteVideo))
      )),
        switchMap(() =>
            this.chatService.getMessages$({
            streamId: this.prd.streamId,
            participantId: this.participant.id,
            role: this.participant.role,
            nickName: this.participant.nickName
          })
        ),
      take(1)
    ).subscribe(messages => this.handleMessage(messages));

    this.privateRtcAdaptorService.getMessage$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: IMessage) => this.handleMessage(message))
  }

  leaveRoom() {
  this.dialogService.leaveRoomConfirm()
    .pipe(
      filter(Boolean),
      switchMap(() => this.finishStream()
      ),
      take(1)
    )
    .subscribe(() => {
      this.privateRtcAdaptorService.canLeave.set(true);
      this.privateRtcAdaptorService.sendLeaveRoom();
      this.privateRtcAdaptorService.leaveRoom();
    })
  }

  finishStream() {
    return this.streamService.finishStream$(
      this.prd.performerId,
      this.prd.streamId
    )
  }

  sentMessage(message: IEmitMessage) {
    if(!message.message) return;

    const { role, nickName, id  } = this.participant;

    let dataPayload!:  IDataPayload;

    switch (message.type) {
      case "tips":
        dataPayload = {
          type: 'tips',
          message: {
            message: `${this.participant.nickName} sent ${ message.amount } tips in a private session`,
            amount: message.amount,
            streamId: this.prd.streamId,
            participantId: 0,
            nickName: nickName,
            role: 'tips-action',
            privacy: 'public',
            privateTo: '',
          }
        };
        break;

      case "message":
        dataPayload = {
          type: 'message',
            message: {
              message: message.message,
              streamId: this.prd.streamId,
              participantId: id,
              nickName: nickName,
              role: role,
              privacy: 'public',
              privateTo: '',
            }
        }
        break
    }

    this.privateRtcAdaptorService.sendData(dataPayload);
    this.chatService.sendMessage$(dataPayload.message)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.handleMessage(dataPayload.message));
  }

  handleMessage(message: IMessage | IMessage[]) {
    if (Array.isArray(message)) {
      this.messages = [...this.messages, ...message];
    } else {
      this.messages = [...this.messages, message];
    }

    this.cdr.detectChanges();
  }

  disableButton = signal(false);
  sendTips(amount: number) {
    this.disableButton.set(true);
    const type: TPaymentsType = 'tips';
    const tips: ITips = {
      type: type,
      streamId: this.prd.streamId,
      performerId: this.prd.performerId,
      amount,
      memberId: this.prd.privateWith,
    }

    this.paymentService.sendTips$(tips)
      .pipe(
        tap((res) => {
          this.sentMessage({
            isSystem: true,
            amount: tips.amount,
            message: res?.message || '',
            type: 'tips'
          })
        }),
        catchError(error => {
          if (error?.error?.message === 'Not enough balance') {
            return this.dialogService.showBalance()
              .afterClosed()
              .pipe(
                switchMap(() => this.paymentService.updateBalance$(this.participant.id))
              )
          }
          throw new Error(error)
        }),
        take(1),
        finalize(() => { this.disableButton.set(false) })
      )
      .subscribe();
  }

  camToggle(isOn: boolean) {
    if (isOn) {
      this.privateRtcAdaptorService.turnOnCamera();
    } else {
      this.privateRtcAdaptorService.turnOffCamera();
    }
  }

  micToggle(isOn: boolean) {
    if (isOn) {
      this.privateRtcAdaptorService.turnOnMic();
    } else {
      this.privateRtcAdaptorService.turnOffMic();
    }
  }
}
