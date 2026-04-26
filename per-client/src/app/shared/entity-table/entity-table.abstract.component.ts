import { AfterViewInit, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  take,
  tap
} from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICommonEntity, ITableItemAction, ITableItemActionEmit } from '../types';
import { FormControl } from '@angular/forms';
import { HttpService } from '../services/http.abstaract.service';

@Component({
    template: '',
    standalone: false,
})
export abstract class EntityTableComponent<T> implements AfterViewInit {
  addButtonName!: string;
  actionsList:ITableItemAction[] | [] = []
  itemService!: HttpService<T>;
  router = inject(Router);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);

  PAGE_SIZE = 100;
  resultsLength = 0;
  totalPages = 0;
  listId!: string;

  displayedColumns: string[] = [];
  itemsList!: ICommonEntity[];

  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.getTableData();
  }

  getTableData(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.paginator.pageIndex = 0),
      ),

      this.paginator.page.pipe(
        startWith(1),
      ),
    ]).pipe(
      switchMap(() => this.getItems()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe()
  }

  getItems() {
    return this.itemService.getItemList$(
      this.searchControl.value || '',
      this.paginator.pageIndex + 1,
      this.PAGE_SIZE,
      this.listId
    ).pipe(
      map(({entities, meta}) => {
        if(!this.displayedColumns.length && entities.length > 0 ) {
          (this.displayedColumns = [...Object.keys(entities[0])]);
        }
        this.totalPages = meta.totalPages;
        this.resultsLength = meta.itemCount;
        this.itemsList = entities;
      }),
    )
  }

  getAction(action: ITableItemActionEmit) {
      (this[action.actionName as keyof this] as Function)(action.value);
  }

 deleteItem(entityId: number) {
  this.itemService.deleteItem$(entityId)
    .pipe(
      switchMap(() => {
        if (this.searchControl.value && this.itemsList.length === 1 && this.totalPages === 1) {
          this.resetSearch();
        }

        if (this.itemsList.length === 1) {
          --this.paginator.pageIndex;
        }

        return this.getItems();
      }),
      take(1),
    ).subscribe();
  }

  editItem(entityId: number) {
    this.router.navigate(['edit', entityId], { relativeTo: this.route });
  }

  addItem() {
    this.router.navigate(['add'], {relativeTo: this.route});
  }

  resetSearch() {
    this.searchControl.setValue('');
  }
}
