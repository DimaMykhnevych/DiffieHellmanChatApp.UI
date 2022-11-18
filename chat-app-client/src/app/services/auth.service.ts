import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrentUserService } from './current-user.service';
import { TokenService } from './token.service';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { AppSettings } from '../settings';
import { map } from 'rxjs/operators';
import { AuthForm } from '../models/auth-form';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _http: HttpClient,
    private _tokenService: TokenService,
    private _currentUserService: CurrentUserService
  ) {}

  public isAuthenticated(): boolean {
    return !!this._tokenService.token;
  }

  public authorize(form: AuthForm): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${AppSettings.apiHost}/auth/token`, form)
      .pipe(
        map((response: AuthResponse) => {
          if (!response.isAuthorized) {
            return response;
          }
          this._tokenService.token = response.token;
          this._currentUserService.userInfo = response.userInfo;

          return response;
        })
      );
  }

  public unauthorize(): void {
    this._tokenService.clearToken();
    this._currentUserService.userInfo = null as any;
  }
}
