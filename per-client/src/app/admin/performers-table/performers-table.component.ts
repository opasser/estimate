import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IPerformer, ITableItemAction } from '../../shared/types';
import { PerformersService } from '../../shared/services/performers.service';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';

const actionList: ITableItemAction[] = [
  {
    actionName:  'editItem',
    propertyName: 'id',
    iconNane: 'edit',
    tooltip: 'Edit performer'
  },
  {
    actionName:  'deleteItem',
    propertyName: 'id',
    iconNane: 'delete_forever',
    tooltip: 'Delete performer',
  },
  {
    actionName:  'editPortfolio',
    propertyName: 'id',
    iconNane: 'photo',
    tooltip: 'Edit portfolio'
  },
];

@Component({
    selector: 'app-performers',
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
export class PerformersTableComponent extends EntityTableComponent <IPerformer> {
  override itemService = inject(PerformersService);
  override addButtonName = 'Add performer';
  override actionsList : ITableItemAction[] = actionList;

  editPortfolio(entityId: number){
    this.router.navigate(['portfolio', entityId], {relativeTo: this.route});
  }
}
