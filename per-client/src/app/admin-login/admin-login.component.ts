import { Component, inject } from '@angular/core';
import { MatCardModule} from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { InputComponent } from '../shared/input/input.component';
import { LOGIN_PATH, LoginService } from '../shared/services/login.service';
import { LoginAbstractComponent } from '../shared/login/login.abstract.component';

@Component({
    selector: 'app-admin-login',
    imports: [
        MatCardModule,
        ReactiveFormsModule,
        InputComponent,
    ],
    templateUrl: '../shared/login/login.component.html',
    styleUrl: '../shared/login/login.component.scss',
    providers: [
        LoginService,
        {
            provide: LOGIN_PATH, useValue: 'admin-login'
        }
    ]
})

export class AdminLoginComponent extends LoginAbstractComponent {
  // ----delete----->
  authService = inject(AuthService);
  //------>
  title = 'Admin Login';
  override REDIRECT = 'admin';


  // ----delete----->
  clearToken() {
    this.authService.removeToken()
  }

  login() {
    const email = 'admin@bunny.com';
    const password = 'bunny_admin';
    this.form.patchValue({email, password});
  }
 //------>
}
