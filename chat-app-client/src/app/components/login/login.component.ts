import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthForm } from 'src/app/models/auth-form';
import { AuthResponse } from 'src/app/models/auth-response';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form: FormGroup = this._builder.group({});
  public errorMessage: string = '';

  constructor(
    private _builder: FormBuilder,
    private _router: Router,
    private _auth: AuthService
  ) {}

  public ngOnInit(): void {
    this.initializeForm();
  }

  public onLoginButtonClick(): void {
    const username: string = this.form.value.login;
    this.performLogin({ username: username });
  }

  private performLogin(value: AuthForm): void {
    this._auth.authorize(value).subscribe((authResponse: AuthResponse) => {
      if (authResponse.isAuthorized) {
        this._router.navigate(['/chat']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this._builder.group({
      login: new FormControl('', [Validators.required]),
    });
  }

  get login() {
    return this.form.get('login');
  }
}
