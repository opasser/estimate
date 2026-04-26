import { CanDeactivateFn } from '@angular/router';
import { PrivateRoomComponent } from './private-room.component';
import { map, of, switchMap, tap } from 'rxjs';

export const confirmDeactivateGuard: CanDeactivateFn<PrivateRoomComponent> = (component,) => {
  if (component.privateRtcAdaptorService.canLeave()) {
    return of(true);
  }

  return component.dialogService.leaveRoomConfirm()
    .pipe(
      switchMap(isConfirmed => {
        if (!isConfirmed) {
          return of(false);
        } else {
          return component.finishStream().pipe(
            tap(() => component.privateRtcAdaptorService.sendLeaveRoom()),
            map(() => true)
          );
        }
      })
    )
};
