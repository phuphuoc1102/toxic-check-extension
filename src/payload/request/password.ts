export interface CreatePasswordParams {
  name: string;
  username: string;
  password: string;
  url?: string;
  logo?: string;
  note?: string;
  isAutoFill?: boolean;
  isAutoLogin?: boolean;
  folderId?: string;
  isRequiredMasterPassword?: boolean;
  isPinned?: boolean;
  masterPassword?: string;
}
