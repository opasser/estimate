import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { take } from 'rxjs';
import { ILogin, ILoginForm } from '../types';

@Component({
    template: '',
    standalone: false
})
export abstract class LoginAbstractComponent {
  loginService = inject(LoginService);
  router = inject(Router);

  disable = signal<boolean>(false)
  REDIRECT!:string;
  form: FormGroup<ILoginForm>;

  constructor(
  ) {
    this.form = new FormGroup<ILoginForm>({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(255)
      ])
    });
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
          this.form.get(key)?.markAsTouched()
        }
      }

      return
    }
    this.disable.set(true);

    const loginValue = <ILogin>this.form.value;

    this.loginService.login$(loginValue)
      .pipe(take(1))
      .subscribe({
          next: () => this.router.navigate([this.REDIRECT]),
          error: () => this.disable.set(false)
        }
      )
  }
}
