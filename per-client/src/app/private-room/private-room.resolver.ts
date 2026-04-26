import { ActivatedRouteSnapshot } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { inject} from '@angular/core';
import { capFirLet } from '../shared/services/helpers';
import { AuthService } from '../shared/services/auth.service';
import { IJwtPayload } from '../shared/types';
import { StreamService } from '../shared/services/stream.service';

export const privateRoomResolver = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const streamService = inject(StreamService);
  const roomId = route.params['roomId'];

  return authService.role$().pipe(
    filter(role => role !== 'guest'),
    map((role: string) => (authService[`get${capFirLet(role)}` as keyof AuthService] as Function)())
  )
  .pipe(
    switchMap(({ role, id, nickName }: IJwtPayload) =>
      streamService.getPrivateRoomData$({
        streamId: roomId,
        role: role[0],
        participantId: id
      }).pipe(
        filter(({status}) => status === 'active'),
        map(prd => {
          const { performerId, privateWith } = prd;

          if (
              (role[0] === 'performer' && performerId === id) ||
              (role[0] === 'member' && privateWith === id)
          ) {
            return { ...prd, participant: { role: role[0], id, nickName } };
          } else {
            return false;
          }
        })
      )
    )
  )
}
