import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { LocalStorageKey, LocalStorageService } from './local-storage.service';
import { IInputDeviceInfo, IMessage, TDeviceType } from '../types';
import { FormControl } from '@angular/forms';
import { filter, Subject, switchMap } from 'rxjs';
import { DialogService } from './dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackBarService } from './snack-bar.service';

@Injectable()
export abstract class WebrtcService implements OnDestroy {
  protected localStorage = inject(LocalStorageService);
  protected snackBarService = inject(SnackBarService);
  dialogService = inject(DialogService);

  webRTCAdaptor!: WebRTCAdaptor;

  videoDevices = signal<IInputDeviceInfo[]>([]);
  audioDevices = signal<IInputDeviceInfo[]>([]);

  getMessage$$ = new Subject<IMessage>();

  videoDeviceForm  = new FormControl();
  audioDeviceForm = new FormControl();

  protected _streamId!: string

  get streamId(): string {
    return this._streamId;
  }

  set streamId(value: string) {
    this._streamId = value;
  }

  constructor() {
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

  setDevicesForSelect(devices: IInputDeviceInfo[], type: string) {
    const deviceType = `${type}Devices` as `${TDeviceType}Devices`;
    const deviceForm = `${type}DeviceForm` as `${TDeviceType}DeviceForm`;

    this[deviceType].set(devices.filter((dev => dev.kind === `${type}input`))
      .filter(dev => !dev.label.includes('Virtual')));

    const deviceId = this.localStorage.getItem(`${type}DeviceId`);

    this[deviceForm].setValue(
      deviceId
        ? this[deviceType]().find(dev => dev.deviceId === deviceId)
        : this[deviceType]()[0]
    )
  }

  ngOnDestroy() {
    this.webRTCAdaptor && this.webRTCAdaptor.closeWebSocket();
  }
}
