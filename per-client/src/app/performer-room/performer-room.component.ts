import {
  ChangeDetectorRef,
  Component,
  DestroyRef, effect,
  inject, OnDestroy,
  OnInit, signal, ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ChatComponent } from '../chat/chat.component';
import { ChatService } from '../chat/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StreamService } from '../shared/services/stream.service';
import { RtcAdaptorService } from '../shared/services/rtc-adaptor.service';
import { catchError, defer, EMPTY, filter, finalize, from, map, of, switchMap, take, tap } from 'rxjs';
import { StreamVisibilityDirective } from './stream-visibility.directive';
import { ViewAvatarComponent } from '../shared/view-avatar/view-avatar.component';
import { PseudoStreamComponent } from './pseudo-stream/pseudo-stream.component';
import { OnlyGuestDirective } from '../shared/only-guest.directive';
import { PER_API_URL, PerformersService } from '../shared/services/performers.service';
import { GalleryComponent } from './gallery/gallery.component';
import { OnlyMemberDirective } from '../shared/only-member.directive';
import { AntPlayerComponent } from './ant-player/ant-player.component';
import { environment } from '../../environments/environment';
import { PaymentsService } from '../shared/services/payments.service';
import { ToggleMenuDirective } from '../shared/toggle-menu.directive';
import { PAY_API_URL } from '../admin/service/payments-table.service';
import {
  IEmitMessage,
  IEvent,
  IMessage, IDataPayload,
  IOldImage,
  ITips,
  TPaymentsType,
  TRole, IRoom
} from '../shared/types';
import { DialogService } from '../shared/services/dialog.service';
import { checkMediaAccess } from '../shared/services/helpers';

@Component({
    selector: 'app-performer-room',
    imports: [
      ChatComponent,
      OnlyGuestDirective,
      StreamVisibilityDirective,
      ViewAvatarComponent,
      GalleryComponent,
      OnlyMemberDirective,
      AntPlayerComponent,
      PseudoStreamComponent,
      ToggleMenuDirective,
    ],
    providers: [
        { provide: PAY_API_URL, useValue: 'payment'},
        PaymentsService,
        { provide: PER_API_URL, useValue: '/gallery' },
        PerformersService,
        RtcAdaptorService
    ],
    templateUrl: './performer-room.component.html',
    styleUrl: './performer-room.component.scss'
})
export class PerformerRoomComponent implements OnInit, OnDestroy {
  rtcAdaptorService = inject(RtcAdaptorService);
  authService = inject(AuthService);
  private streamService = inject(StreamService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);
  private performerService = inject(PerformersService);
  private paymentService = inject(PaymentsService);
  private dialogService = inject(DialogService);

  private router = inject(Router);
  coinsArr = [1, 2, 5, 10, 20, 50];
  member = this.authService.getMember();
  messages: IMessage[] = [];
  privateMessages: IMessage[] = [];
  performerInfo!: IRoom;
  signupUrl = environment.signupUrl;
  ONLINE_STATUS = "online";
  isPrivateChat = false;
  isPrivateSession = signal<boolean>(false)

  gallery = signal<IOldImage[]>([]);

  @ViewChild(AntPlayerComponent) antPlayerComponent!: AntPlayerComponent;

  constructor() {
    effect(() => {
      if(this.rtcAdaptorService.status() === 'offline' && this.antPlayerComponent) {
        this.antPlayerComponent.ngOnDestroy();
        clearInterval(this.interval);
      }
    });
  }

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap(({nickName}) => this.streamService.getPerformerRoomData$(nickName)),
        switchMap((performerInfo) => {
            this.performerInfo = performerInfo;

            return this.performerService.getPortfolio$(performerInfo.id).pipe(
              tap((portfolio) => this.gallery.set(portfolio)),
              map(() => performerInfo)
            )
          }
        ),
        filter((performerInfo) => Boolean(performerInfo.streamId) && this.authService.isAuthMember),
        switchMap((performerInfo) => defer(() => this.rtcAdaptorService.runVideo())
          .pipe(switchMap(() => of(performerInfo.streamId)))
        ),
        switchMap(streamId => {
          this.rtcAdaptorService.streamId = streamId;
          this.sendStillConnected();

          return this.chatService.getMessages$({
            streamId: streamId,
            participantId: this.member.id,
            role: this.member.role[0],
            nickName: this.member.nickName
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(messages => this.handleMessage(messages));

    this.rtcAdaptorService.getMessage$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: IMessage) => this.handleMessage(message))

    this.rtcAdaptorService.getEvent$$.pipe(
      tap((e) => this.isPrivateSession.set(e.memberId !== this.member.id && e.status === 'accept')),
      filter(e => e.memberId === this.member.id),
      switchMap(e => {
          if (e.status === 'accept') {
            this.goToPrivateSession(e);
            return of(null)
          } else {
            this.disableButton.set(false)
            return this.dialogService.showReject();
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  interval!: any;
  sendStillConnected() {
    const eventPayload: IEvent = {
      eventName: "stillConnected",
      memberNickName: this.member.nickName
    };

    this.interval = setInterval(() => this.rtcAdaptorService.sendEvent(eventPayload), 10000);
  }

  goToPrivateSession(streamData: IEvent) {
    this.rtcAdaptorService.streamId = '';
    this.router.navigate(['private', streamData.streamId]);
  }

  sentMessage(message: IEmitMessage) {
    if(!message.message || !this.rtcAdaptorService.streamId) return;
    let dataPayload!:  IDataPayload;

    switch (message.type) {
      case "tips":
        dataPayload = {
          type: 'tips',
          message: {
            message: `${this.member.nickName} sent ${ message.amount } tips`,
            amount: message.amount,
            streamId: this.rtcAdaptorService.streamId,
            participantId: 0,
            nickName: this.member.nickName,
            role: 'tips-action',
            privacy:  'public',
            privateTo: '',
          }
        };
      break;

      case "message":
        dataPayload = {
          type: 'message',
          message: {
            message: message.message,
            streamId: this.rtcAdaptorService.streamId,
            participantId: this.member.id,
            nickName: this.member.nickName,
            role: this.member.role[0] as TRole,
            privacy: this.isPrivateChat ? 'private' : 'public',
            privateTo: this.isPrivateChat ? this.performerInfo.nickName : '',
          }
        };
      break
    }

    this.rtcAdaptorService.sendData(dataPayload);
    this.chatService.sendMessage$(dataPayload.message)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.handleMessage(dataPayload.message));
  }

  handleMessage(message: IMessage | IMessage []) {
    if(Array.isArray(message)) {
        this.sortMessages(message);
    } else {
      if(message.privacy === 'private') {
        if(this.isPersonalMessage(message)) this.privateMessages = [...this.privateMessages, message];
      } else {
        this.messages = [...this.messages, message];
      }
    }
    this.cdr.detectChanges();
  }

  isPersonalMessage(message: IMessage) {
    return message.privateTo === this.member.nickName
      ||(message.role === 'member' && message.participantId === this.member.id);
  }

  sortMessages(messages: IMessage[]) {
    const privateMessages: IMessage[] = [];
    const publicMessages: IMessage[] = [];

    messages.forEach(message => {
      message.privacy === 'private'
        ? privateMessages.push(message)
        : publicMessages.push(message);
    });

    this.messages = publicMessages;
    this.privateMessages = privateMessages;
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    setTimeout(() =>  this.rtcAdaptorService.stopPlaying(), 100);
  }

  openTab(event: any, tab: HTMLElement) {
    if(Array.from(event.target.classList).includes('active')) {
      return;
    }

    event.target.classList.add('active');
    tab.classList.remove('active');
    this.isPrivateChat = !this.isPrivateChat;
  }

  disableButton = signal(false);
  sendTips(amount: number) {
    this.disableButton.set(true);
    const type: TPaymentsType = 'tips';
    const tips: ITips = {
      type: type,
      streamId: this.rtcAdaptorService.streamId,
      performerId: this.performerInfo.id,
      amount,
      memberId: this.member.id
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
          if (error.error.message === 'Not enough balance') {
            return this.dialogService.showBalance()
              .afterClosed()
              .pipe(
                switchMap(() => this.paymentService.updateBalance$(this.member.id))
            )
          }
          throw new Error(error)
        }),
        take(1),
        finalize(() => { this.disableButton.set(false) })
      )
      .subscribe();
  }

  requestCamToCam() {
    this.disableButton.set(true);
    from(checkMediaAccess())
      .pipe(
        switchMap(({ camera, microphone }) => {
          if(camera && microphone) {
            return this.paymentService.checkBalanceForPrivateSession$(this.member.id)
          } else {
            this.dialogService.multimediaWarning();
            this.disableButton.set(false);
            return EMPTY;
          }
        }),
        switchMap((balance) => {
          if(Number(balance) > 1) {
            return this.dialogService.showPrivateSessionRequest(this.performerInfo.nickName)
              .pipe(
                tap((confirmed) => {
                  if (confirmed) {
                    const camToCamRequest: IEvent = {
                      eventName: "camToCam",
                      memberNickName: this.member.nickName,
                      memberId: this.member.id,
                      role: this.member.role[0],
                      status: 'request'
                    }

                    this.rtcAdaptorService.sendEvent(camToCamRequest);
                  } else {
                    this.disableButton.set(false);
                  }
                }),
              )
          } else {
            return this.dialogService.showBalance()
              .afterClosed()
              .pipe(
                switchMap(() => {
                 this.disableButton.set(false);
                 return  this.paymentService.updateBalance$(this.member.id)
                }),
              )
          }}
        ),
        take(1)
      )
      .subscribe();
  }
}
