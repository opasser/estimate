import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryTagService } from '../../shared/services/category-tag.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, finalize, map, of, switchMap, take } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory, ICategoryForm } from '../../shared/types';
import { AvatarComponent } from '../../avatar/avatar.component';
import { InputComponent } from '../../shared/input/input.component';
import { deleteNullValue, isDataUpdate } from '../../shared/services/helpers';
import { CdnPipe } from '../../shared/cdn.pipe';
import { SnackBarService } from '../../shared/services/snack-bar.service';

@Component({
  selector: 'app-category-info',
  imports: [
    AvatarComponent,
    FormsModule,
    InputComponent,
    ReactiveFormsModule
  ],
  providers: [CdnPipe],
  templateUrl: './category-info.component.html',
  styleUrl: './category-info.component.scss'
})
export class CategoryInfoComponent implements OnInit {
  categoryService = inject(CategoryTagService);
  private route = inject(ActivatedRoute);
  snackBarService = inject(SnackBarService);
  private router = inject(Router);

  disable = signal<boolean>(false);
  private selectedFile!: FormData;
  categoryUrl!: string;
  formTitle= '';
  form!: FormGroup<ICategoryForm>;
  category!: ICategory;
  private isCategoryEdit: boolean = false;

  constructor() {
    this.form = new FormGroup<ICategoryForm>({
      name: new FormControl(this.category?.name, [ Validators.required ]),
      title: new FormControl(this.category?.title),
      description: new FormControl(this.category?.description),
      seoTitle: new FormControl(this.category?.seoTitle),
      seoDescription: new FormControl(this.category?.seoDescription),
      seoKeywords: new FormControl(this.category?.seoKeywords),
      seoH1: new FormControl(this.category?.seoH1),
    });
  }

  ngOnInit() {
    this.route.url.pipe(
      map(segments => {
        this.isCategoryEdit = segments.some(segment => segment.path === 'edit');
        this.formTitle = this.isCategoryEdit ? 'Edit Category' : 'Add Category';

        return this.isCategoryEdit;
      }),
      filter(Boolean),
      switchMap(() => this.route.params),
      switchMap(({id}) => this.categoryService.getItemById$(Number(id))),
      filter(Boolean),
      take(1),
    ).subscribe({
        next: (category) => {
          this.categoryUrl = category.thumbnail;
          this.category = category;
          this.updateForm();
        },
      }
    )
  }

  private updateForm() {
    this.form.patchValue({...this.category});
  }

  get name() {
    return this.form.controls['name'];
  }

  get title() {
    return this.form.controls['title'];
  }

  get description() {
    return this.form.controls['description'];
  }

  get seoTitle() {
    return this.form.controls['seoTitle'];
  }

  get seoDescription() {
    return this.form.controls['seoDescription'];
  }

  get seoKeywords() {
    return this.form.controls['seoKeywords'];
  }

  get seoH1() {
    return this.form.controls['seoH1'];
  }

  setFile(formData: FormData) {
    this.selectedFile = formData;
  }

  onSubmit() {
    if (this.form.invalid)  {
      for (const key in this.form.controls) {
        if (!this.form.get(key)?.dirty) {
          this.form.get(key)?.markAsTouched();
        }
      }

      return
    }

    this.disable.set(true);

    const newCategoryData = deleteNullValue({
      ...this.category,
      ...this.form.value,
    });

    const isUpdate = isDataUpdate(newCategoryData, this.category);

    const method$ = isUpdate
      ? this.isCategoryEdit
        ? this.categoryService.editItem$(newCategoryData as { id: number })
        : this.categoryService.submitItem$(newCategoryData)
      : of({ id: newCategoryData['id'] });

    method$
      .pipe(
        switchMap(res =>
          this.selectedFile
            ? this.categoryService.uploadImage$(this.selectedFile, res.id)
            : of(res)
        ),
        finalize(() => {
          if (!isUpdate && !this.selectedFile) {
            this.snackBarService.openSnackBar(
              'Edit profile: No changes detected.',
              'notification'
            )
          }
        }),
        take(1),
      )
      .subscribe({
        next: () => this.router.navigate(['admin/categories']),
        error: () => this.disable.set(false),
      });
  }
}
