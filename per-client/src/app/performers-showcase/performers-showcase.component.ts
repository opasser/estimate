import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif, map, Observable, switchMap } from 'rxjs';
import { StreamService } from '../shared/services/stream.service';
import { AsyncPipe } from '@angular/common';
import { ViewAvatarComponent } from '../shared/view-avatar/view-avatar.component';
import { VPerformerShowcaseComponent } from '../vision/v-performer-showcase/v-performer-showcase.component';
import { IRoom } from '../shared/types';


@Component({
  selector: 'app-performers-showcase',
  imports: [AsyncPipe, ViewAvatarComponent, VPerformerShowcaseComponent],
  templateUrl: './performers-showcase.component.html',
  styleUrl: './performers-showcase.component.scss'
})
export class PerformersShowcaseComponent implements OnInit {
  rooms$!: Observable<IRoom[]>;
  router = inject(Router);
  route = inject(ActivatedRoute);
  streamService = inject(StreamService);
  isCategory = signal<boolean>(false);

  ngOnInit() {
    this.rooms$ = this.route.params
      .pipe(
        map(({categoryName}) => {
          this.isCategory.set(!categoryName);
          return categoryName;
        }),
        switchMap((categoryName) =>
          iif(() =>
              Boolean(categoryName),
                this.streamService.getRoomsByCategory$(categoryName),
                this.streamService.getRooms$()
        ))
      )
  }

  goToPerformer(stream: IRoom) {
    this.router.navigate(['performer', stream.nickName]);
  }

   isActive(stream: IRoom ): boolean {
    return Boolean(stream.status === 'active');
  }
}
