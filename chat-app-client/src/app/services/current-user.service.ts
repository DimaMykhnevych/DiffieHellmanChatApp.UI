import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStorageConstants } from '../constants/local-storage-constants';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  public userInfoChanged: Subject<User> = new Subject();

  private _userInfo: User;

  constructor() {
    this._userInfo = { id: '', username: '' };
  }

  public get userInfo(): User {
    return JSON.parse(
      localStorage.getItem(LocalStorageConstants.userInfoStorageKey) || ''
    );
  }

  public set userInfo(info: User) {
    this._userInfo = info;
    localStorage.removeItem(LocalStorageConstants.userInfoStorageKey);
    localStorage.setItem(
      LocalStorageConstants.userInfoStorageKey,
      JSON.stringify(this._userInfo)
    );
    this.userInfoChanged.next(this._userInfo);
  }
}
