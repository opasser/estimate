import { Component, inject} from '@angular/core';
import { StreamTableService } from '../service/stream-table.service';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { IStream, ITableItemAction } from '../../shared/types';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

const actionList: ITableItemAction[] = [
  {
    actionName: 'readChat',
    propertyName: 'streamId',
    iconNane: 'forum',
    tooltip: 'To messages'
  },
  {
    actionName:  'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete chat'
  },
];

@Component({
  selector: 'app-stream-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [StreamTableService],
    templateUrl: '../../shared/entity-table/entity-table.component.html',
    styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class StreamsTableComponent extends EntityTableComponent<IStream>{
  override itemService = inject(StreamTableService);
  isOpens= true;
  override actionsList : ITableItemAction[] = actionList;

  readChat(streamId: string) {
    this.router.navigate(['admin/stream-chat', streamId]);
  }
}

