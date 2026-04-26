import { Component, inject } from '@angular/core';
import { CategoryTagService } from '../shared/services/category-tag.service';
import { Observable } from 'rxjs';
import { ICategory } from '../shared/types';
import { AsyncPipe } from '@angular/common';
import { ViewAvatarComponent } from '../shared/view-avatar/view-avatar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-showcase',
  imports: [
    AsyncPipe,
    ViewAvatarComponent,
  ],
  templateUrl: './category-showcase.component.html',
  styleUrl: './category-showcase.component.scss'
})
export class CategoryShowcaseComponent {
  router = inject(Router);

  categoryService = inject(CategoryTagService);
  categoryList$: Observable<ICategory[]>;

  constructor() {
    this.categoryList$ = this.categoryService.getList$();
  }

  goToPerformer(categoryName: string) {
    this.router.navigate(['categories', categoryName]);
  }
}
