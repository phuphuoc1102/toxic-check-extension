import { IUserProviderResponse } from './user-provider';

export enum role {
  USER,
}
export interface IUser {
  id?: string;
  email: string;
  role: string;
  active_status: string;
  confirmed_at?: number | null;
  created_at?: number;
  session_timeout: number;
  session_timeout_action: string;
  remember_email: number;
  logout_on_close: number;
  two_factors_authentication: number;
  allow_screen_shots: number;
  clear_clipboard: number;
  theme: string;
  is_enabled: number;
  encrypted_password?: string;
}

export interface IUserInfo extends IUser {
  providers: IUserProviderResponse[];
}
