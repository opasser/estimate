import { ElementRef, inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  IDataPayload,
  IPrivateRoomData,
  IPrivateRoomParticipant,
  IUserData
} from '../shared/types';
import { LocalStorageKey } from '../shared/services/local-storage.service';
import { getPrivateStreamId, isEvent, isMessages } from '../shared/services/helpers';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { WebrtcService } from '../shared/services/webrtc.abstract.service';

enum roleRoute {
  member = 'performers',
  performer = 'performer',
}

@Injectable()
export class PrivateRtcAdaptorService extends WebrtcService implements OnDestroy {
  router = inject(Router);
  authService = inject(AuthService);

  roomId!: string;
  participant!: IPrivateRoomParticipant;

  videoElement!: ElementRef;

  canLeave = signal<boolean>(false);
  privateCam = signal<'ON' | 'OFF'>('ON');
  privateMic = signal<'ON' | 'OFF'>('ON');
  initialized = signal<boolean>(false);

  constructor() {
    super();
  }

  async runWebcam() {
    const module =  await import('@antmedia/webrtc_adaptor');
    const WebRTCAdaptor = module.WebRTCAdaptor;


    this.webRTCAdaptor = new WebRTCAdaptor({
      websocket_url: `${environment.webRtcUrl}/WebRTCAppEE/websocket`,
      localVideoId: "privateLocalVideo",
      mediaConstraints: {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: 60,
        },
      },
      debug: true,

      callback: (info: any, obj: any) => {
        // console.log('INFO => ', info,);
        // console.log('OBJECT => ', obj);
        if (info === "initialized") {
          this.initialized.set(info === "initialized");
          this.setMediaData();
        }
        else if (info === "broadcastObject") {

        }
        else if (info === "newTrackAvailable") {
          this.playVideo(obj);

        }
        else if (info === "publish_started") {

        }

        else if(info === 'available_devices') {
          ['audio', 'video'].forEach((type) => this.setDevicesForSelect(obj, type))
        }

        else if (info === "publish_finished") {
          this.leaveRoom()
        }
        else if (info === "browser_screen_share_supported") {

        }

        else if (info === "play_started") {

        }
        else if (info === "play_finished") {

        }
        else if (info === "data_channel_opened") {

        }
        else if (info === "data_channel_closed") {

        }
        else if (info === "data_received") {
          const data = JSON.parse(obj.data);

          if(isEvent(data)) {
            (this[data.eventName as keyof this] as Function)(data)
          } else if (isMessages(data)) {
            this.getMessage$$.next(data.message);
          }
        }
        else if (info === "session_restored") {

        }
        else if (info === "reconnection_attempt_for_player") {

        }
        else if (info === "reconnection_attempt_for_publisher") {

        }
      },
      callbackError: (error: any) => {
        console.error("WebRTCAdaptor error:", error);
      }
    })

    //DEV only
    // this.turnOffMic()
  }

  playVideo(obj: any) {
    const videoElement = this.videoElement.nativeElement;

    if (!videoElement.srcObject) {
      videoElement.srcObject = new MediaStream();
    }

    const stream = videoElement.srcObject as MediaStream;
    stream.addTrack(obj.track);


    obj.track.onended = (event: any) => {
      // console.log("track is ended with id: " + event.target.id);
      // console.log('onended', event);
      stream.removeTrack(obj.track);
    };

    obj.stream.onremovetrack = (event: any) => {
      // console.log("track is removed with id: " + event.track.id);
      // console.log('onremovetrack', event);
      this.snackBarService.openSnackBar('The private session was interrupted', 'notification');
      stream.removeTrack(event.track);
    };
  }

  // in conference mode we use the streamId as a roomId and create a new streamId for all participants
  joinRoom({ streamId: roomId,  participant }: Required<IPrivateRoomData>, videoElement: ElementRef) {
    this.participant = participant;
    this.roomId = roomId;
    this.videoElement = videoElement;
    this.streamId = this.getStreamId();

    this.publish(roomId, this.streamId);

    setTimeout(() => this.webRTCAdaptor.play(roomId, undefined, roomId));
  }

  getStreamId(): string {
    let streamId = this.localStorage.getItem(LocalStorageKey.streamId);

    if (!streamId) {
      streamId = getPrivateStreamId(this.participant.id, this.participant.role);
      this.localStorage.setItem(LocalStorageKey.streamId, streamId);
    }

    return streamId;
  }

  publish(roomId: string, streamId: string) {
    this.webRTCAdaptor.publish(streamId, undefined, undefined, undefined, streamId, roomId);
  }

  turnOnCamera() {
    this.updateMediaData(LocalStorageKey.privateCam, 'ON');
    this.webRTCAdaptor.turnOnLocalCamera(this.streamId);
  }

  turnOffCamera() {
    this.updateMediaData(LocalStorageKey.privateCam, 'OFF');
    this.webRTCAdaptor.turnOffLocalCamera(this.streamId)
  }

  turnOnMic() {
    this.updateMediaData(LocalStorageKey.privateMic, 'ON');
    this.webRTCAdaptor.unmuteLocalMic();
  }

  turnOffMic() {
    this.updateMediaData(LocalStorageKey.privateMic, 'OFF');
    this.webRTCAdaptor.muteLocalMic()
  }

  updateMediaData(localStorageKey: string, state: 'ON'| 'OFF') {
    this.localStorage.setItem(LocalStorageKey[localStorageKey as LocalStorageKey], state);

    (this[localStorageKey as keyof this] as WritableSignal<'ON' | 'OFF'>).set(state)
  }

  setMediaData() {
    const cam = this.localStorage.getItem(LocalStorageKey.privateCam) as 'ON' | 'OFF' | null;
    cam && (this.privateCam.set(cam));

    const mic = this.localStorage.getItem(LocalStorageKey.privateMic) as 'ON' | 'OFF' | null;
    mic && (this.privateMic.set(mic));

    cam === 'ON' && this.webRTCAdaptor.turnOnLocalCamera(this.streamId);
    cam === 'OFF' && this.webRTCAdaptor.turnOffLocalCamera(this.streamId);
    mic === 'ON' && this.webRTCAdaptor.unmuteLocalMic();
    mic === 'OFF' && this.webRTCAdaptor.muteLocalMic();
  }

  leaveRoom({ eventName }: any = {} ) {
    if (eventName === 'leaveRoom') {
      this.snackBarService.openSnackBar('Participant left the private room', 'success')
    }
    this.canLeave.set(true);
    this.webRTCAdaptor.stop(this.streamId);
    this.localStorage.removeItem(LocalStorageKey.privateCam);
    this.localStorage.removeItem(LocalStorageKey.privateMic);
    this.localStorage.removeItem(LocalStorageKey.streamId);
    this.redirectPreviousPage();
  }

  redirectPreviousPage() {
    this.router.navigate([roleRoute[this.participant.role as keyof typeof roleRoute]]);
  }

  sendLeaveRoom() {
    this.webRTCAdaptor.sendData(this.streamId, JSON.stringify({ eventName: 'leaveRoom' }));
  }

  sendData(dataPayload: IDataPayload) {
    this.webRTCAdaptor.sendData(this.streamId, JSON.stringify(dataPayload));
  }

  private balanceUpdated = true;
  updateBalance({ userData }: { userData: IUserData | null }): void {
    const isMember = this.participant?.role === 'member';
    if (!isMember) return;

    if (userData) {
      this.authService.setUserData(userData);
    } else if (this.balanceUpdated) {
      this.balanceUpdated = false;
      this.dialogService.showBalance();
    }
  }
}
