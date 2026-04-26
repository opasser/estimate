import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { WebcamComponent } from '../webcam/webcam.component';
import { AuthService } from '../shared/services/auth.service';
import { defer, filter, iif, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { StreamService } from '../shared/services/stream.service';
import { ChatComponent } from '../chat/chat.component';
import { ChatService } from '../chat/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RtcAdaptorService } from '../shared/services/rtc-adaptor.service';
import {
  IDataPayload,
  IEmitMessage,
  IEvent,
  IMessage,
  IRegisterStream, TPrivacy,
} from '../shared/types';
import { Router } from '@angular/router';
import { getPrivateRoomId } from '../shared/services/helpers';
import { DialogService } from '../shared/services/dialog.service';
import { SelectMediaDevicesComponent } from '../shared/select-media-devices/select-media-devices.component';

@Component({
  selector: 'app-performer-dashboard',
  imports: [WebcamComponent, ChatComponent, SelectMediaDevicesComponent],
  providers: [ RtcAdaptorService ],
    templateUrl: './performer-dashboard.component.html',
    styleUrl: './performer-dashboard.component.scss'
})
export class PerformerDashboardComponent implements OnInit {
  rtcAdaptorService = inject(RtcAdaptorService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private streamService = inject(StreamService);
  private chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  private PRIVACY_STATUS_PUBLIC: TPrivacy ='public';
  private PRIVACY_STATUS_PRIVATE: TPrivacy ='private';

  performer = this.authService.getPerformer();
  messages: IMessage[] = [];
  isBroadcast = signal<boolean>(false);

  ngOnInit() {
    defer(() => this.rtcAdaptorService.runWebcam(this.performer.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.rtcAdaptorService.startStream$$
      .pipe(
        switchMap((streamId) => this.streamService.registerStream$({
          streamId,
          performerId: this.performer.id,
          privacy: this.PRIVACY_STATUS_PUBLIC
        })),
        takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.rtcAdaptorService.finishStream$$
      .pipe(switchMap((streamId) => this.streamService.finishStream$(this.performer.id, streamId)),
        takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.rtcAdaptorService.getMessage$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: IMessage) => this.handleMessage(message))

    this.chatService.getMessages$({
      streamId: this.rtcAdaptorService.streamId,
      participantId: this.performer.id,
      role: this.performer.role[0],
      nickName: this.performer.nickName
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(messages => this.handleMessage(messages));

    this.rtcAdaptorService.getEvent$$.pipe(
      filter(res => res.status === 'request' && Boolean(res.memberNickName)),
      switchMap((res: any) => {
        return this.dialogService.showPrivateSessionRequestAccept(res.memberNickName)
          .pipe(withLatestFrom(of(res)))
      }),
      switchMap(([isConfirmed, event]:[boolean, IEvent]) => {
        const privateStream: IRegisterStream = {
          //In a private session we use roomId as streamId
          streamId: getPrivateRoomId(this.performer.id),
          performerId: this.performer.id,
          privateWith: event.memberId,
          privacy: this.PRIVACY_STATUS_PRIVATE
        }

        return iif(() => isConfirmed,
          this.streamService.registerStream$(privateStream),
          of(null).pipe(tap(() => this.rtcAdaptorService.sendEvent({...event, status: 'reject'})))
        )
      }),
      filter(Boolean),
      switchMap(({ streamData }) => {
          this.rtcAdaptorService.sendEvent({
            ...streamData, status: 'accept',
            memberId: streamData.privateWith,
            eventName: 'camToCam'
          });

        return this.streamService.finishStream$(this.performer.id, this.rtcAdaptorService.streamId)
        .pipe(
          tap(() => {
            this.rtcAdaptorService.stopPublishing();
            for (const member of this.rtcAdaptorService.memberCounter) {
              clearTimeout(member[1])
            }

            this.rtcAdaptorService.memberCounter.clear();
            this.rtcAdaptorService.updateCounter();
            this.rtcAdaptorService.streamId='';
          }),
          map(() => streamData.streamId)
        )
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((roomId) => {
      this.rtcAdaptorService.streamId = '';
      this.router.navigate(['private', roomId])
    })
 }

  sentMessage(message: IEmitMessage) {
  if(!message.message || !this.rtcAdaptorService.streamId) return;

    const dataPayload: IDataPayload = {
       type: 'message',
       message: {
         message: message.message,
         streamId: this.rtcAdaptorService.streamId,
         participantId: this.performer.id,
         nickName: this.performer.nickName,
         role: this.performer.role[0],
         privacy: message.privateTo ? 'private' : 'public',
         privateTo: message.privateTo || '',
       }
    };

    this.rtcAdaptorService.sendData(dataPayload);

    this.chatService.sendMessage$(dataPayload.message)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.handleMessage(dataPayload.message));
  }

  handleMessage(message: IMessage | IMessage []) {
    this.messages = Array.isArray(message) ? message : [...this.messages, message];
    this.cdr.detectChanges();
  }

 disabled = false
  startPublishing() {
    this.disabled = true;
    setTimeout(() => this.disabled = false, 2000)
    this.rtcAdaptorService.startPublishing();
  }

  disableStopStreamButton = false
  stopPublishing() {
    this.disabled = true;
    setTimeout(() => this.disabled = false, 2000)
    this.rtcAdaptorService.stopPublishing();
    this.messages = [];
  }
}
