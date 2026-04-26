import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { LocalStorageKey } from './local-storage.service';
import { IEvent, IDataPayload } from '../types';
import { filter, Subject, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { StreamService } from './stream.service';
import { getStreamId, isEvent, isMessages } from './helpers';
import { WebrtcService } from './webrtc.abstract.service';

@Injectable()
export class RtcAdaptorService extends WebrtcService implements OnDestroy {
  private streamService = inject(StreamService);

  performerId!: number;
  startStream$$ = new Subject<string>();
  finishStream$$ = new Subject<string>();
  getEvent$$ = new Subject<IEvent>();
  memberCounter= new Map();

  status = signal('offline');
  memberList = signal<[string, number][]>([]);

  constructor() {
    super();
    this.setStoredMemberList();

    this.videoDeviceForm.valueChanges.pipe(
      filter(Boolean),
      switchMap(dev => {
        this.localStorage.setItem(LocalStorageKey.videoDeviceId, dev.deviceId);
        return this.webRTCAdaptor.switchVideoCameraCapture(this.streamId, dev.deviceId, null)}
      ),
      takeUntilDestroyed(),
    ).subscribe();

    this.audioDeviceForm.valueChanges.pipe(
      filter(Boolean),
      switchMap(dev => {
        this.localStorage.setItem(LocalStorageKey.audioDeviceId, dev.deviceId);
        return this.webRTCAdaptor.switchAudioInputSource(this.streamId, dev.deviceId)}
      ),
      takeUntilDestroyed(),
    ).subscribe();
  }

  override get streamId() {
    if (!this._streamId) {
      this._streamId = this.localStorage.getItem(LocalStorageKey.streamId) || '';
    }
    return this._streamId;
  }

  override set streamId(streamId: string) {
    if(streamId) {
      this._streamId = streamId;
      this.localStorage.setItem(LocalStorageKey.streamId, streamId)
    } else {
      this._streamId = '';
      this.localStorage.removeItem(LocalStorageKey.streamId);
    }
  }

  async runVideo() {
    const module =  await import('@antmedia/webrtc_adaptor');
    const WebRTCAdaptor = module.WebRTCAdaptor;
    this.webRTCAdaptor = new WebRTCAdaptor({
      websocket_url: `${environment.webRtcUrl}/WebRTCAppEE/websocket`,
      remoteVideoId: 'remoteVideo',
      peerconnection_config: {
        'iceServers': [{'urls': 'stun:stun1.l.google.com:19302'}]
      },

      mediaConstraints: {
        video: false,
        audio: false,
      },

      sdp_constraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
      },
      isPlayMode : 'playOnly',

      callback: (info: any, obj: any) => {
        // console.log('----callback video----', info);
        if (info === "initialized") {
          this.streamId && this.startPlaying();
        }
        else if (info === "play_started") {
          this.status.set("online");
          this.webRTCAdaptor.getStreamInfo(this.streamId);
        }
        else if (info === "data_received") {
          const data = JSON.parse(obj.data);

          if(isEvent(data) && data.eventName !== 'stillConnected') {
              (this[data.eventName as keyof this] as Function)(data)
          } else if (isMessages(data)) {
            this.getMessage$$.next(data.message);
          }
        }
        else if (info === "streamInformation") {
          // TODO research it
          // console.log('---streamInformation--', obj);
        }
        else if (info === "play_finished") {
          this.status.set("offline");
        }
      },
    });
  }

  async runWebcam(performerId: number) {
    this.performerId = performerId;
    const module =  await import('@antmedia/webrtc_adaptor');
    const WebRTCAdaptor = module.WebRTCAdaptor;

    this.webRTCAdaptor = new WebRTCAdaptor({
      websocket_url: `${environment.webRtcUrl}/WebRTCAppEE/websocket`,
      localVideoId: 'localVideo',
      // bandwidth: '90000', // default is 900 kbps, string can be 'unlimited'
      dataChannelEnabled: true, // enable or disable data channel

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

      sdp_constraints: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false,
      },

      peerconnection_config: {
        'iceServers': [{'urls': 'stun:stun1.l.google.com:19302'}]
      },

      callback: (info: any, obj: any) => {
        if (info === "initialized") {
          this.streamId && this.webRTCAdaptor.publish(this.streamId);
          this.streamId && this.status.set("Broadcast restored - Stream Id: " + this.streamId);
        }
        else if(info === 'available_devices') {
          ['audio', 'video'].forEach((type) => this.setDevicesForSelect(obj, type))
        }
        else if (info === "data_received") {
          const data = JSON.parse(obj.data);

          if(isEvent(data)) {
            (this[data.eventName as keyof this] as Function)(data)
          } else if (isMessages(data)) {
            this.getMessage$$.next(data.message);
          }
        }
        else if (info === "publish_started") {
          this.status.set("Broadcasting - Stream Id: " + this.streamId);
          this.streamId && this.startStream$$.next(this.streamId);
        }
        else if (info === "publish_finished") {
          this.stopPublishing();
          this.status.set("offline");
          this.finishStream$$.next(this.streamId);
          this.streamId = '';
          this.memberCounter.clear();
          this.updateCounter();
        }
      },
      callbackError: (error: any) => {
        if(error === 'NotAllowedError') {
          this.dialogService.multimediaWarning();
        }
        console.error("webRTCAdaptor Error callback:", error);
      }
    });

    // dev
    // this.stopMicrophone();
  }

  setStreamId() {
    if(!this.streamId) {
      this.localStorage.setItem(LocalStorageKey.streamId, getStreamId(this.performerId));
    }
  }

  camToCam(event: IEvent) {
    this.getEvent$$.next(event);
  }

  stillConnected(event: IEvent) {
    const timeout = setTimeout(() => {
      this.memberCounter.delete(event.memberNickName);
      this.memberLeft(event);
    }, 15000);

    if(this.memberCounter.has(event.memberNickName)) {
      clearTimeout(this.memberCounter.get(event.memberNickName));
      this.memberCounter.set(event.memberNickName, timeout);
      this.updateCounter();
    } else {
      this.memberCounter.set(event.memberNickName, timeout)
      this.memberJoin(event);
    }
  }

  updateCounter() {
    const memberList = Array.from(this.memberCounter.entries());
    this.memberList.set(memberList);
    this.localStorage.setItem(LocalStorageKey.memberList, JSON.stringify(memberList));
  }

  memberJoin(event: IEvent) {
    this.updateCounter();

    this.streamService.updateMembersCounter$(this.memberCounter.size, this.streamId)
      .pipe(take(1)).subscribe(() => {
      this.snackBarService.openSnackBar(
        `Member ${event.memberNickName} joined the room`,
        'notification'
      )
    })

  }

  memberLeft(event: IEvent) {
    this.memberCounter.delete(event.memberNickName);
    this.updateCounter();
    this.streamService.updateMembersCounter$(this.memberCounter.size, this.streamId)
      .pipe(take(1)).subscribe(() => {
      this.snackBarService.openSnackBar(
        `Member ${event.memberNickName} left the room`,
        'notification'
      )
    })
  }

  sendData(dataPayload: IDataPayload) {
    this.webRTCAdaptor.sendData(this.streamId, JSON.stringify(dataPayload));
  }

  sendEvent(eventPayload: IEvent) {
    this.webRTCAdaptor.sendData(this.streamId, JSON.stringify(eventPayload));
  }

  setStoredMemberList() {
    const data = this.localStorage.getItem(LocalStorageKey.memberList);
    const storedMemberList = data ? JSON.parse(data) : [];
    this.memberList.set(storedMemberList);
    this.memberCounter = new Map(storedMemberList);
  }

  startPublishing() {
    if(this.streamId) return;
    this.setStreamId();
    this.webRTCAdaptor.publish(this.streamId);
  }

  stopPublishing() {
    this.webRTCAdaptor.stop(this.streamId);
  }

  turnOffLocalCamera() {
    this.webRTCAdaptor.turnOffLocalCamera(this.streamId);
  }

  turnOnLocalCamera() {
    this.webRTCAdaptor.turnOnLocalCamera(this.streamId);
  }

  startPlaying() {
    this.webRTCAdaptor.play(this.streamId)
  }

  stopPlaying() {
    if(!this.webRTCAdaptor) return;

    this.webRTCAdaptor.stop(this.streamId);
  }

  stopMicrophone() {
     this.webRTCAdaptor.muteLocalMic()
  }

}
