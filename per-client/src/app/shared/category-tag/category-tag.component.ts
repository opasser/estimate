import { Component, computed, ElementRef, inject, Injector, input, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { CategoryTagService } from '../services/category-tag.service';
import { take } from 'rxjs';
import { SnackBarService } from '../services/snack-bar.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TAG_SERVICE, TagService } from '../../admin/tags-table/tags-table.component';

const tagName = new Map([
  ['app-category', 'Category'],
  ['app-tag', 'Tag'],
])

enum tagNames {
  'CATEGORY'= 'Category',
  'TAG' = 'Tag',
}

const featureServiceMap = new Map<string, any>([
  ['Category', CategoryTagService],
  ['Tag', TAG_SERVICE],
]);

@Component({
  selector: 'app-category, app-tag',
  imports: [FormsModule, MatInput, MatFormField, MatLabel],
  providers: [
    CategoryTagService,
    {
      provide: TAG_SERVICE,
      useFactory: TagService,
      deps: [ Injector ],
    }
  ],
  templateUrl: './category-tag.component.html',
  styleUrl: './category-tag.component.scss'
})
export class CategoryTagComponent {
  control = input.required<FormControl>();
  addItem = input<boolean>(true);
  snackBarService = inject(SnackBarService);
  injector = inject(Injector)
  elementRef = inject(ElementRef);

  tagName = signal<string>(<string>tagName.get(this.elementRef.nativeElement.localName));
  isPanelOpen = signal(false);
  searchCategory = signal('');

  itemService: CategoryTagService = this.injector.get(featureServiceMap.get(this.tagName()));

  categoryList =  toSignal(
    this.itemService.getNameList$(), { initialValue: [] }
  );

  toggleCategory(category: string) {
    let newCatArr: string[];

    if (this.control().value.includes(category)) {
      newCatArr = this.control().value.filter((cat: string) => cat !== category);
    } else {
      newCatArr = [...this.control().value, category];
    }

    newCatArr = newCatArr.sort((a, b) => a.localeCompare(b));
    this.control().patchValue([...newCatArr]);
  }

  updateState() {
    this.isPanelOpen.set(!this.isPanelOpen())
  }

  addCategory() {
    if (!this.searchCategory()) {
      return;
    }

    if(this.categoryList().includes( this.searchCategory())) {
      this.snackBarService.openSnackBar(
        `Category ${this.searchCategory()} already exists`,
        'notification'
      )

      return;
    }

    this.itemService.submitItem$({ name: this.searchCategory() })
      .pipe(take(1))
      .subscribe(({ name }) => {
        this.categoryList().push(name);
        this.toggleCategory(name);
        this.searchCategory.set('');
      })
  }

  categorySearch = computed(() =>
      this.categoryList().filter((category: string) => category.includes(this.searchCategory())
    )
  );
}
