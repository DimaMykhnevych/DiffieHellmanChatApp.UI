import { User } from './user';

export interface AuthResponse {
  isAuthorized: boolean;
  token: string;
  userInfo: User;
}
