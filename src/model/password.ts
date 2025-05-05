export interface IPassword {
  id: string;
  name: string;
  url?: string | null;
  username: string;
  password: string;
  logo?: string | null;
  note?: string | null;
  updated_at: string;
  created_at: string;
  is_pinned: boolean;
  is_auto_fill: boolean;
  is_auto_login: boolean;
  is_required_master_password: boolean;
  password_health: string;
}
export interface IPasswordItem {
  id: string;
  name: string;
  username: string;
  logo: string;
  password_health: PasswordHealth;
  is_required_master_password: boolean;
}
export enum PasswordHealth {
  VERY_STRONG = 'VERY_STRONG',
  STRONG = 'STRONG',
  MEDIUM = 'MEDIUM',
  WEAK = 'WEAK',
}
export interface IPasswordHealthRate {
  very_strong: number;
  strong: number;
  medium: number;
  weak: number;
}
export interface IPasswordBasicInfo {
  id: string;
  name: string;
  username: string;
  logo?: string | null;
  password_health: PasswordHealth;
}
export interface PasswordHistoryDTO {
  action: string;
  modified_at: string;
  modified_by: string;
}
export interface IPasswordDTO {
  id: string;
  name: string;
  username: string;
  password_health: string | null;
  is_pinned: boolean;
  is_required_master_password: boolean;
  url: string | null;
  logo: string | null;
  is_shared: boolean;
  is_shared_with_me: boolean;
  can_share: boolean;
  can_edit: boolean;
  user_permission_id: string;
  created_at: string;
}

export interface IPasswordHealthRateDTO {
  count_weak: number;
  count_strong: number;
  count_very_strong: number;
  count_medium: number;
}

export interface IPasswordFilled {
  name: string;
  username: string;
  password: string;
}
