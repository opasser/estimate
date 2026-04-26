import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IAdmin, ITableItemAction } from '../../shared/types';
import { MatPaginator } from '@angular/material/paginator';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminTableService } from '../service/admin-table.service';

const actionList: ITableItemAction[] = [
  {
    actionName:  'editItem',
    propertyName: 'id',
    iconNane: 'edit',
    tooltip: 'Edit admin data'
  },
  {
    actionName: 'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete admin'
  },
];


@Component({
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [AdminTableService],
    selector: 'app-admin-list',
    templateUrl: '../../shared/entity-table/entity-table.component.html',
    styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class AdminsTableComponent extends EntityTableComponent <IAdmin> {
  override addButtonName = 'Add admin';
  override itemService = inject(AdminTableService);
  override actionsList : ITableItemAction[] = actionList;
}
