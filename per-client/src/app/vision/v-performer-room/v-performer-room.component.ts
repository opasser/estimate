import {
  Component,
  DestroyRef,
  inject, OnInit,
  signal
} from '@angular/core';
import { VisionService } from '../vision.service';
import { ActivatedRoute } from '@angular/router';
import { iif, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VAuthService } from '../v-auth.service';
import { OnlyMemberDirective } from '../../shared/only-member.directive';
import { environment } from '../../../environments/environment';
import { NgClass } from '@angular/common';
import { PseudoStreamComponent } from '../../performer-room/pseudo-stream/pseudo-stream.component';
import { VImageUrlPipe } from '../v-image-url.pipe';
import { MatIcon } from '@angular/material/icon';
import { OnlyGuestDirective } from '../../shared/only-guest.directive';
import { VProfileComponent } from './v-profile/v-profile.component';
import { VGalleryComponent } from './v-gallery/v-gallery.component';
import { TranslocoPipe } from "@jsverse/transloco";
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'vision-performer-room',
  imports: [
    OnlyMemberDirective, NgClass, PseudoStreamComponent, VImageUrlPipe, MatIcon, OnlyGuestDirective, VProfileComponent, VGalleryComponent,
    TranslocoModule
],
  providers: [TranslocoPipe],
  templateUrl: './v-performer-room.component.html',
  styleUrl: './v-performer-room.component.scss'
})
export class VPerformerRoomComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private visionService = inject(VisionService);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  authService = inject(VAuthService);
  profile!: Vision.IPerformerProfile;
  gallery = signal<Vision.IPerformerContent[]>([]);
  deferFlag = signal<boolean>(false);
  activeTab = signal(0);
  roomData!: Vision.IRoom;
  streamData!: Vision.IStreamData;
  signupUrl = environment.signupUrl;
  tabs = [

   { label: 'tabs.photos' },
   { label: 'tabs.videos' }
  ];

  delKeyArr = ['active', 'profile', 'room', 'langCode', 'languageSkillCodes', 'modelName', 'favoriteDrink', 'favoriteFlower', 'measureBust', 'measureHips', 'measureWaist'];

  ngOnInit() { this.roomInit() };

  roomInit() {
    this.route.params.pipe(
      map(params => params['nickName']),
      switchMap(name => this.visionService.getContentByPerformerName$(name)),
      switchMap(({content, profile, room}) => {
        this.delKeyArr.forEach(item => {
          delete profile[item]
        })

        this.gallery.set(content);
        this.profile = profile;
        this.roomData = room;
        return iif(() => this.authService.isAuthMember && Boolean(room?.roomId),
                this.visionService.getVideoChatUrl(room?.roomId),
                of(null))
      }),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe((streamData) => {
        if(!streamData) {
          this.deferFlag.set(true);
          return
        }

        this.streamData = {
          videoStreamToken: streamData.videoStreamToken,
          videoStreamUrl: this.sanitizer.bypassSecurityTrustResourceUrl(streamData.videoStreamUrl) as SafeResourceUrl
        };
        this.deferFlag.set(true);
      })
  }

  filterPerformerByName(performerContent: Vision.IPerformerContent[], performerName: string) {
    return performerContent.filter((performer)=> performer.performerName === performerName)
  }

  findRoomByName(onlineRooms: Vision.IRoom[], performerName: string) {
    return onlineRooms.find(room => room.performerName === performerName) as Vision.IRoom;
  }
}
