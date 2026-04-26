import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ItemTableComponent } from '../../shared/item-table/item-table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { EntityTableComponent } from '../../shared/entity-table/entity-table.abstract.component';
import { ChatService } from '../../chat/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IMessage } from '../../shared/types';

@Component({
  selector: 'app-chat-table',
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
export class ChatsTableComponent extends EntityTableComponent<IMessage>{
  override itemService = inject(ChatService);

  override ngAfterViewInit() {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({id}) => {
      this.listId = id;
      this.getTableData();
    });
  }
}
