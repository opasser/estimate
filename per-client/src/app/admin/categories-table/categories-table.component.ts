import { Component, inject } from '@angular/core';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { ITableItemAction, ITag } from '../../shared/types';
import { CategoryTagService } from '../../shared/services/category-tag.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

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
  selector: 'app-category-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: '../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class CategoriesTableComponent extends EntityTableComponent <ITag> {
  override itemService = inject(CategoryTagService);
  override addButtonName = 'Add Category';
  override actionsList : ITableItemAction[] = actionList;
}
