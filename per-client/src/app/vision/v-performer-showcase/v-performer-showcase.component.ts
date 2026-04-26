import { Component, inject } from '@angular/core';
import { VisionService } from '../vision.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { VImageUrlPipe } from '../v-image-url.pipe';
import { Router } from '@angular/router';
import { VAuthService } from '../v-auth.service';


@Component({
  selector: 'vision-performer-showcase',
  imports: [
    AsyncPipe,
    VImageUrlPipe,
  ],
  templateUrl: './v-performer-showcase.component.html',
  styleUrl: './v-performer-showcase.component.scss'
})
export class VPerformerShowcaseComponent {
  router = inject(Router);
  authService = inject(VAuthService);
  visionService = inject(VisionService);
  rooms$!: Observable<Vision.IRoom[]>;

  constructor() {
    if (!this.authService.isAuthVision) return;
    this.rooms$ = this.visionService.getRooms$();
  }

  goToRoom(room: Vision.IRoom) {
    this.router.navigate(['vision/performer', room.performerName]);
  }
}
