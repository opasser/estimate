import { Component, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '../../shared/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, map, of, switchMap, take, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminTableService } from '../service/admin-table.service';
import { IAdmin, IAdminForm, INewAdminDate } from '../../shared/types';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { isDataUpdate } from '../../shared/services/helpers';

@Component({
    selector: 'app-admin-page',
    imports: [
        InputComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './admin-info.component.html',
    styleUrl: './admin-info.component.scss'
})
export class AdminInfoComponent implements OnInit {
  title= ''
  form!: FormGroup<IAdminForm>;
  disable = signal<boolean>(false);

  private route = inject(ActivatedRoute);
  private adminService = inject(AdminTableService);
  private router = inject(Router);
  private snackBarService = inject(SnackBarService);
  admin!: IAdmin;
  isAdminEdit: boolean = false;

  constructor() {
    this.form = new FormGroup<IAdminForm>({
      name: new FormControl(this.admin?.name, [
        Validators.required,
        Validators.maxLength(255)
      ]),
      email: new FormControl(this.admin?.email, [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]),
      password: new FormControl('', [
        Validators.maxLength(255),
        Validators.minLength(8),
      ]),
    });
  }

  ngOnInit() {
    this.route.url.pipe(
      map(segments => {
        this.isAdminEdit = segments.some(segment => segment.path === 'edit');
        this.title = this.isAdminEdit ? 'Edit Admin' : 'Add Admin';
        !this.isAdminEdit && this.password.setValidators(
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.minLength(8),
          ]
        );

        return this.isAdminEdit;
      }),
      filter(Boolean),
      switchMap(() => this.route.params),
      switchMap(({id}) => {
        return this.adminService.getItemById$(Number(id));
      }),
      filter(Boolean),
      take(1),
    ).subscribe({
      next: (params) => {
        this.admin = {...params};

        this.updateForm();
      },
    }
    )
  }

  private updateForm() {
    this.form.patchValue(this.admin);
  }

  get name() {
    return this.form.controls['name'];
  }

  get email() {
    return this.form.controls['email'];
  }

  get password() {
    return this.form.controls['password'];
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

    const newAdminDate = {
      ...this.isAdminEdit && {id: this.admin.id},
      ...this.form.value
    } as INewAdminDate;

    if(!newAdminDate.password) { delete newAdminDate.password }

    const isUpdate = isDataUpdate(newAdminDate, this.admin);

    const method$ = isUpdate
      ? this.isAdminEdit
        ? this.adminService.editItem$(newAdminDate)
        : this.adminService.submitItem$(newAdminDate)
        :  of(null)
              .pipe(
                  tap(() => this.snackBarService.openSnackBar(
                      'Edit profile: No changes detected.',
                      'notification'
                    ))
              )

    method$
      .pipe(
        take(1)
      ).subscribe({
          next: () => this.router.navigate(['admin/admins']),
          error: () =>  this.disable.set(false)
        }
      )
  }

  isFormDataUpdate(newDate: INewAdminDate): boolean {
    if(newDate.password) {
      return true;
    }

    for(let i in this.form.value) {
      if (i !== 'password' &&
        (newDate[i as keyof typeof newDate] !==
          this.admin[i as keyof typeof this.admin]
        )
      ) {
        return true;
      }
    }

    return false;
  }
}
