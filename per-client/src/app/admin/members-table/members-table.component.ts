import { Component, inject } from '@angular/core';
import { MembersTableService } from '../service/members-table.service';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { IMember, ITableItemAction } from '../../shared/types';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

const actionList: ITableItemAction[] = [
  {
    actionName: 'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete member'
  },
];

@Component({
  selector: 'app-members-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [MembersTableService],
    templateUrl: '../../shared/entity-table/entity-table.component.html',
    styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class MembersTableComponent extends EntityTableComponent<IMember>{
  override itemService = inject(MembersTableService);
  override actionsList : ITableItemAction[] = actionList;
}
