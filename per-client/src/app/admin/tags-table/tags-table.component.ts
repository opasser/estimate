import { Component, inject, InjectionToken, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ICategory, ITableItemAction } from '../../shared/types';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { CategoryTagService } from '../../shared/services/category-tag.service';

export const TAG_API_URL = new InjectionToken<string>('ApiUrl');
export const TAG_SERVICE = new InjectionToken<CategoryTagService>('TAG_SERVICE');

export function TagService(injector: Injector): CategoryTagService {
  const apiUrl = injector.get(TAG_API_URL);
  const service = new CategoryTagService(apiUrl);
  service.featureName = 'tags';
  return service;
}

const actionList: ITableItemAction[] = [
  {
    actionName:  'editItem',
    propertyName: 'id',
    iconNane: 'edit',
    tooltip: 'Edit tag'
  },
  {
    actionName:  'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete tag',
  },
];

@Component({
  selector: 'app-tag-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    {
      provide: TAG_SERVICE,
      useFactory: TagService,
      deps: [ Injector ],
    }
  ],
  templateUrl: '../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../shared/entity-table/entity-table.component.scss'
})
export class TagsTableComponent extends EntityTableComponent <ICategory>  {
  override itemService = inject(TAG_SERVICE);
  override addButtonName = 'Add Tag';
  override actionsList : ITableItemAction[] = actionList;
}
