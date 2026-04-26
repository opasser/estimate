import { Component, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '../../shared/input/input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { filter, finalize, iif, map, of, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { INewPerformerDate, IPerformer, IPerformerForm } from '../../shared/types';
import { PerformersService } from '../../shared/services/performers.service';
import { AvatarComponent } from '../../avatar/avatar.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { CdnPipe } from '../../shared/cdn.pipe';
import { decimalValidator, integerValidator, isDataUpdate, minAgeValidator } from '../../shared/services/helpers';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';
import { CategoryTagComponent } from '../../shared/category-tag/category-tag.component';

@Component({
  selector: 'app-performer-info',
  imports: [
    InputComponent,
    ReactiveFormsModule,
    AvatarComponent,
    MatSlideToggle,
    DatePickerComponent,
    CategoryTagComponent,
  ],
    providers: [CdnPipe],
    templateUrl: './performer-info.component.html',
    styleUrl: './performer-info.component.scss'
})
export class PerformerInfoComponent implements OnInit {
  title= ''
  form!: FormGroup<IPerformerForm>;
  disable = signal<boolean>(false);
  avatarUrl!: string;
  performer!: IPerformer;
  private selectedFile!: FormData;
  private isPerformerEdit: boolean = false;
  private route = inject(ActivatedRoute);
  performerService = inject(PerformersService);
  private router = inject(Router);
  private snackBarService = inject(SnackBarService);

  constructor() {
    this.form = new FormGroup<IPerformerForm>({
      name: new FormControl(this.performer?.name, [
        Validators.required,
        Validators.maxLength(255)
      ]),
      nickName: new FormControl(this.performer?.nickName, [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]),
      email: new FormControl(this.performer?.email, [
        Validators.required,
        Validators.email,
        Validators.maxLength(255),
      ]),
      password: new FormControl('', [
        Validators.maxLength(255),
        Validators.minLength(8),
      ]),
      paymentRate: new FormControl(this.performer?.paymentRate || 50, [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        integerValidator(),
      ]),
      c2cAmount: new FormControl(this.performer?.c2cAmount || "1.00", [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        decimalValidator(),
      ]),
      category: new FormControl(this.performer?.category || []),
      tag: new FormControl(this.performer?.tag || []),
      isPublic: new FormControl(this.performer?.isPublic || false),
      about: new FormControl(this.performer?.about || '',),
      birthday: new FormControl(this.performer?.birthday, [
        Validators.required,
        minAgeValidator(18),
      ]),
      gender: new FormControl(this.performer?.gender),
      bodyType: new FormControl(this.performer?.bodyType),
      language: new FormControl(this.performer?.language),
      sexualOrientation: new FormControl(this.performer?.sexualOrientation),
    });
  }

  ngOnInit() {
    this.route.url.pipe(
      map(segments => {
        this.isPerformerEdit = segments.some(segment => segment.path === 'edit');
        this.title = this.isPerformerEdit ? 'Edit Performer' : 'Add Performer';
        !this.isPerformerEdit && this.password.setValidators(
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.minLength(8),
          ]
        );

        return this.isPerformerEdit;
      }),
      filter(Boolean),
      switchMap(() => this.route.params),
      switchMap(({id}) => this.performerService.getItemById$(Number(id))),
      take(1),
    ).subscribe({
        next: (performer) => {
          this.avatarUrl = performer.avatarUrl;
          this.performer = { ...performer, c2cAmount:  performer.c2cAmount.toFixed(2) };
          this.updateForm();
        },
      }
    )
  }

  private updateForm() {
    this.form.patchValue({...this.performer});
  }

  get name() {
    return this.form.controls['name'];
  }

  get nickName() {
    return this.form.controls['nickName'];
  }

  get email() {
    return this.form.controls['email'];
  }

  get password() {
    return this.form.controls['password'];
  }

  get paymentRate() {
    return this.form.controls['paymentRate'];
  }

  get c2cAmount() {
    return this.form.controls['c2cAmount'];
  }

  get category() {
    return this.form.controls['category'];
  }

  get tag() {
    return this.form.controls['tag'];
  }

  get about() {
    return this.form.controls['about'];
  }

  get birthday() {
    return this.form.controls['birthday'];
  }

  get gender() {
    return this.form.controls['gender'];
  }

  get sexualOrientation() {
    return this.form.controls['sexualOrientation'];
  }

  get bodyType() {
    return this.form.controls['bodyType'];
  }

  get language() {
    return this.form.controls['language'];
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

    const newPerformerDate = {
      ...this.isPerformerEdit && { id: this.performer.id },
      ...this.form.value,
      paymentRate: Number(this.form.value.paymentRate),
    } as INewPerformerDate ;

    if(!newPerformerDate.password) {
      delete newPerformerDate.password;
    }

    const isUpdate = isDataUpdate(newPerformerDate, this.performer);

    const method$ = isUpdate
      ? this.isPerformerEdit
        ? this.performerService.editItem$(newPerformerDate)
        : this.performerService.submitItem$(newPerformerDate)
      : of({ id: newPerformerDate.id });

    method$
      .pipe(
        switchMap((res) => iif(() => Boolean(this.selectedFile),
          this.performerService.uploadImage$(this.selectedFile, res.id),
          of(res)
          )
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
        next: () => this.router.navigate(['admin/performers']),
        error: () => this.disable.set(false),
      });
  }
}
