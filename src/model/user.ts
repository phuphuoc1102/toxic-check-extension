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
  is_enabled: number;
  encrypted_password?: string;
  blocked_toxic_words?: number;
}

export interface IUserInfo extends IUser {
  providers: IUserProviderResponse[];
}
