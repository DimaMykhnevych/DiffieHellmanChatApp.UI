import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageConstants } from 'src/app/constants/local-storage-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form: FormGroup = this._builder.group({});
  public errorMessage: string = '';

  constructor(private _builder: FormBuilder, private _router: Router) {}

  public ngOnInit(): void {
    this.initializeForm();
  }

  public onLoginButtonClick(): void {
    const username: string = this.form.value.login;
    localStorage.setItem(LocalStorageConstants.userInfoStorageKey, username);
    this._router.navigate(['/chat']);
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
