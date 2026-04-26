import {
  ChangeDetectorRef,
  Component, effect,
  ElementRef, inject,
  input,
  output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IEmitMessage, IMessage } from '../shared/types';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, MatTooltip],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private cdr = inject(ChangeDetectorRef);
  private breakpointObserver = inject(BreakpointObserver);

  messages = input<IMessage[]>([]);
  participantId = input<number>();
  isCommonRoom = input<boolean>(true);
  role = input<string>();

  sentMessage = output<IEmitMessage>();

  ROLE_PERFORMER = 'performer';
  ROLE_MEMBER = 'member';
  ACTION_TYPE_TIPS = 'tips-action';

  @ViewChild('chatView') private chatView!: ElementRef;
  @ViewChild('messageTextarea') private messageTextarea!: ElementRef<HTMLTextAreaElement>;

  inputText: string = '';
  isMobileView: boolean = false;

  constructor() {
    effect(() => {
      if(this.messages().length) {
        this.cdr.detectChanges();
        this.scrollToBottom()
      }
    });

    this.breakpointObserver
      .observe(['(max-width: 992px)'])
      .pipe(takeUntilDestroyed())
      .subscribe(result => this.isMobileView = result.matches);
  }

  sand() {
    this.sentMessage.emit({ message: this.inputText, privateTo: this.privateTo, type: 'message' });
    this.inputText = '';
    this.privateTo = '';
  }

  scrollToBottom(): void {
    if (this.chatView) {
      if (this.isMobileView) {
        this.chatView.nativeElement.scrollTop = -this.chatView.nativeElement.scrollHeight;
      } else {
        this.chatView.nativeElement.scrollTop = this.chatView.nativeElement.scrollHeight;
      }
    }
  }

  getParticipantColor(message: IMessage) {
    let color = "chat-participant-role";

    if ( message.role === 'performer') {
      color = 'chat-performer-role'
    } else if ( message.participantId === this.participantId() ) {
      color = 'chat-member-role'
    }
      return color
  }

  privateTo: string = '';
  choseMember(nickName: string) {
    this.messageTextarea.nativeElement.focus();
    if (nickName === this.privateTo) {
      this.privateTo = '';
      return
    }
    this.privateTo = nickName;
  }
}

