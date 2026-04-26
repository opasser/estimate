import { ResolveFn, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { VisionService } from './vision.service';
import { map, Observable, take } from 'rxjs';
import { VAuthService } from './v-auth.service';
import { VPerformerRoomComponent } from './v-performer-room/v-performer-room.component';
import { visionEnvironment } from './environment.vision';
import { memberAuthGuard } from '../shared/member-auth-guard-fn';

export const vAuthResolver: ResolveFn<Observable<boolean> | boolean> = () => {
  const performerService = inject(VisionService);
  const authService = inject(VAuthService);

  const authenticateGuest = (): Observable<boolean> => {
    const body: Vision.IAuthBody = {
      nickname: visionEnvironment.guestNickname,
      uniqueUserId: visionEnvironment.guestId,
      tokenValidForMinutes: visionEnvironment.tokenLife,
    };

    return performerService.authenticate$(body).pipe(
      map(Boolean),
      take(1)
    );
  };

  const authenticateMember = (): Observable<boolean> => {
    const member = authService.getMember();
    const body: Vision.IAuthBody = {
      nickname: member.nickName,
      uniqueUserId: `eonly-${member.id}`,
      tokenValidForMinutes: visionEnvironment.tokenLife,
    };

    return performerService.authenticate$(body).pipe(
      map(Boolean),
      take(1)
    );
  };

  if (authService.isVisionGuestAuth && authService.isAuthMember) {
    return authenticateMember();
  }

  if (authService.isAuthVision) {
    if (authService.isVisionMemberAuth || authService.isVisionGuestAuth) {
      return true;
    }

    if (authService.isAuthMember) {
      return authenticateMember();
    }
  }

  return authenticateGuest();
};

export const VISION_ROUTES: Routes = [
  {
    path: 'vision/performer/:nickName',
    // only for clearing local storage if token expired
    canActivate: [memberAuthGuard],
    resolve: {isUserAuth: vAuthResolver},
    component: VPerformerRoomComponent
  },

];
