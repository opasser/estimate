import { Component, inject, OnInit } from '@angular/core';
import { VisionService } from '../vision/vision.service';
import { StreamService } from '../shared/services/stream.service';
import { combineLatest, map, Observable } from 'rxjs';
import { IRoom } from '../shared/types';
import { AsyncPipe } from '@angular/common';
import { ViewAvatarComponent } from '../shared/view-avatar/view-avatar.component';
import { VImageUrlPipe } from '../vision/v-image-url.pipe';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { environment } from '../../environments/environment';
import { BannerService } from '../banner/banner.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IShowBanner } from '../main/main.component';
import { BannerComponent } from '../banner/banner.component';


@Component({
  selector: 'app-common-performer-showcase',
  imports: [
    AsyncPipe,
    ViewAvatarComponent,
    VImageUrlPipe,
    BannerComponent
  ],
  templateUrl: './common-performer-showcase.component.html',
  styleUrl: './common-performer-showcase.component.scss'
})
export class CommonPerformerShowcaseComponent implements OnInit {
  visionService = inject(VisionService);
  streamService = inject(StreamService);
  authService = inject(AuthService);
  bannerService = inject(BannerService);
  router = inject(Router);
  rooms$!: Observable<any[]>;

  banners!: IShowBanner;
  role!: string;
  sections = this.bannerService.sections;

  constructor() {
    this.bannerService.getBannerData$([ this.sections.cus ])
      .pipe(takeUntilDestroyed())
      .subscribe(({banners, role}) => {
        this.banners = banners;
        this.role = role;
      })
  }

  ngOnInit(): void {
    this.rooms$ = combineLatest([
      this.streamService.getRooms$(),
      this.visionService.getRooms$()
    ])
      .pipe(
        map(([roms, vRoms]: [IRoom[], Vision.IRoom[]]) => {
          let active: (IRoom|Vision.IRoom)[] = [];
          let unActive: (IRoom|Vision.IRoom)[] = [];

          [...roms, ...vRoms].forEach(room => {
            if('streamId' in room && room.streamId || 'roomId' in room && room.roomId) {
              active.push(room);
            } else {
              unActive.push(room);
            }
          })

          return [...active, ...unActive];
        })
      )
  }

  goToVRoom(room: Vision.IRoom) {
    if (!this.authService.isAuthMember) {
      window.location.href = environment.signupUrl;
      return;
    }

    this.router.navigate(['vision/performer', room.performerName]);
  }

  goToRoom(stream: IRoom) {
    if (!this.authService.isAuthMember) {
      window.location.href = environment.signupUrl;
      return;
    }

    this.router.navigate(['performer', stream.nickName]);
  }

  isActive(stream: IRoom ): boolean {
    return Boolean(stream.status === 'active');
  }

  protected readonly Boolean = Boolean;
}
