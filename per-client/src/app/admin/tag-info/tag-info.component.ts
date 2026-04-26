import { Component, inject, Injector, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { ITag, ITagForm } from '../../shared/types';
import { filter, finalize, map, of, switchMap, take } from 'rxjs';
import { deleteNullValue, isDataUpdate } from '../../shared/services/helpers';
import { TAG_SERVICE, TagService } from '../tags-table/tags-table.component';

@Component({
  selector: 'app-tag-info',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: TAG_SERVICE,
      useFactory: TagService,
      deps: [ Injector ],
    }
  ],
  templateUrl: './tag-info.component.html',
  styleUrl: './tag-info.component.scss'
})
export class TagInfoComponent {
  categoryService = inject(TAG_SERVICE);
  private route = inject(ActivatedRoute);
  snackBarService = inject(SnackBarService);
  private router = inject(Router);

  disable = signal<boolean>(false);

  formTitle= '';
  form!: FormGroup<ITagForm>;
  category!: ITag;
  private isCategoryEdit: boolean = false;

  constructor() {
    this.form = new FormGroup<ITagForm>({
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
        this.formTitle = this.isCategoryEdit ? 'Edit Tag' : 'Add Tag';

        return this.isCategoryEdit;
      }),
      filter(Boolean),
      switchMap(() => this.route.params),
      switchMap(({id}) => this.categoryService.getItemById$(Number(id))),
      filter(Boolean),
      take(1),
    ).subscribe({
        next: (category) => {
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

    const newTagData = deleteNullValue({
      ...this.category,
      ...this.form.value,
    });

    const isUpdate = isDataUpdate(newTagData, this.category);

    const method$ = isUpdate
      ? this.isCategoryEdit
        ? this.categoryService.editItem$(newTagData as { id: number })
        : this.categoryService.submitItem$(newTagData)
      : of({ id: newTagData['id'] });

    method$
      .pipe(
        finalize(() => {
          if (!isUpdate) {
            this.snackBarService.openSnackBar(
              'Edit profile: No changes detected.',
              'notification'
            )
          }
        }),
        take(1),
      )
      .subscribe({
        next: () => this.router.navigate(['admin/tags']),
        error: () => this.disable.set(false),
      });
  }
}
