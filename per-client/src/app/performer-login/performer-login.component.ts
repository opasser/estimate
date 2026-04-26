import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { LOGIN_PATH, LoginService } from '../shared/services/login.service';
import { LoginAbstractComponent } from '../shared/login/login.abstract.component';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../shared/input/input.component';

@Component({
    selector: 'app-performer-login',
    imports: [
        MatCardModule,
        ReactiveFormsModule,
        InputComponent,
    ],
    templateUrl: '../shared/login/login.component.html',
    styleUrl: '../shared/login/login.component.scss',
    providers: [
        LoginService,
        { provide: LOGIN_PATH, useValue: 'performer-login' }
    ]
})
export class PerformerLoginComponent extends LoginAbstractComponent {
  // ----delete----->
  authService = inject(AuthService);

  title = 'Performer Login'
  override REDIRECT = 'performer'


  // ----delete----->
  clearToken() {
    this.authService.removeToken()
  }

  login() {
    const email = 'performer@bunny.com';
    const password = 'bunny_performer';
    this.form.patchValue({email, password});
  }
}
