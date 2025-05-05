export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
    APPLE = 'APPLE',
  }
  
export interface IUserProviderResponse {
    id: string;
    email: string;
    name: string;
    photo: string;
    provider: AuthProvider;
  }