import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { IBanner, ITableItemAction } from '../../shared/types';
import { BannerTableService } from '../service/banner-table.service';

const actionList: ITableItemAction[] = [
  {
    actionName:  'editItem',
    propertyName: 'id',
    iconNane: 'edit',
    tooltip: 'Edit category'
  },
  {
    actionName:  'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete category',
  },
];

@Component({
  selector: 'app-banners-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [BannerTableService],
  templateUrl: '../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class BannersTableComponent extends EntityTableComponent<IBanner> {
  override itemService = inject(BannerTableService);
  override addButtonName = 'Add Banner';
  override actionsList : ITableItemAction[] = actionList;
}
