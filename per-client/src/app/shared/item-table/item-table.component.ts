import { Component, effect, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable, MatTableModule
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ITableItemAction, ITableItemActionEmit } from '../types';
import { ViewAvatarComponent } from '../view-avatar/view-avatar.component';
import { TitlePipe } from '../column-title.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { EllipsisPipe } from '../ellipsis.pipe';
import { EmptyStringPipe } from '../empty-string.pipe';

@Component({
  selector: 'app-item-table',
  imports: [
    MatTableModule,
    MatTable,
    MatHeaderRow,
    MatRow,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatButtonModule,
    MatIconModule,
    ViewAvatarComponent,
    DatePipe,
    TitlePipe,
    MatTooltip,
    CurrencyPipe,
    EmptyStringPipe,
    EllipsisPipe
  ],
    templateUrl: './item-table.component.html',
    styleUrl: './item-table.component.scss'
})
export class ItemTableComponent {
  dateFormat = "yyyy-MM-dd / hh:mm";
  dataNameCell = ['createdAt', 'updatedAt', 'lastLogin', 'startTime', 'endTime', 'data'];
  getAction = output<ITableItemActionEmit>();

  itemsList = input.required<any[]>();
  displayedColumns = input.required<string[]>();
  actionList = input<ITableItemAction[]>([]);

  constructor() {
    effect(() => {
      if(this.actionList().length && this.displayedColumns().length) {
        this.displayedColumns().push('actions');
      }
    });
  }
}
