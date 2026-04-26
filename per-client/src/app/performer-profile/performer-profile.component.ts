import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { PER_API_URL, PerformersService } from '../shared/services/performers.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { INewPerformerDate, IPerformer, IPerformerProfileForm } from '../shared/types';
import { AvatarComponent } from '../avatar/avatar.component';
import { InputComponent } from '../shared/input/input.component';
import { finalize, iif, of, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';
import { SnackBarService } from '../shared/services/snack-bar.service';
import { CategoryTagComponent } from '../shared/category-tag/category-tag.component';
import { decimalValidator, isDataUpdate, minAgeValidator } from '../shared/services/helpers';
import { DatePickerComponent } from '../shared/date-picker/date-picker.component';

@Component({
  selector: 'app-performer-profile',
  imports: [
    AvatarComponent,
    InputComponent,
    ReactiveFormsModule,
    DatePickerComponent,
    CategoryTagComponent,
  ],
    providers: [
      { provide: PER_API_URL, useValue: '/performer/profile' },
      PerformersService,
    ],
    templateUrl: './performer-profile.component.html',
    styleUrl: './performer-profile.component.scss'
})
export class PerformerProfileComponent implements OnInit {
  private authService = inject(AuthService);
  performerService = inject(PerformersService);
  private router = inject(Router);
  private snackBarService = inject(SnackBarService);
  private selectedFile!: FormData;
  private disable = signal<boolean>(false);
  performer!: IPerformer;
  avatarUrl!: string;
  form!: FormGroup<IPerformerProfileForm>;

  constructor() {
    this.form = new FormGroup<IPerformerProfileForm>({
      name: new FormControl({value: this.performer?.name, disabled: true}),
      nickName: new FormControl(this.performer?.nickName, [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]),
      email: new FormControl({value: this.performer?.email, disabled: true}),
      password: new FormControl('', [
        Validators.maxLength(255),
        Validators.minLength(8),
      ]),
      c2cAmount: new FormControl(this.performer?.c2cAmount || "1.00", [
        Validators.required,
        Validators.min(1),
        Validators.max(100),
        decimalValidator(),
      ]),
      category: new FormControl(this.performer?.category || []),
      tag: new FormControl(this.performer?.tag || []),
      about: new FormControl({value: this.performer?.about, disabled: false}),
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
    const performer  = this.authService.getPerformer();
    this.performerService.getItemById$(performer.id)
      .subscribe({
        next: (performer) => {
          this.performer = this.performer = { ...performer, c2cAmount:  performer.c2cAmount.toFixed(2)};
          this.avatarUrl = performer.avatarUrl;
          this.updateForm();
        },
      })
  }

  private updateForm() {
    this.form.patchValue(this.performer);
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
      ...this.performer,
      ...this.form.value,
    } as INewPerformerDate;

    if(!newPerformerDate.password) {
      delete newPerformerDate.password;
    }

    const isUpdate = isDataUpdate(newPerformerDate, this.performer);

    of(isUpdate)
      .pipe(
        switchMap((e) => iif(() => e,
            this.performerService.editItem$(newPerformerDate),
            of({id: newPerformerDate.id})
          )
        ),
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
        next: () => this.router.navigate(['performer']),
        error: () => this.disable.set(false),
      });
  }
}
