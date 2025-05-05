import { API_ENDPOINT } from '../../constants/env';
import { DataResponse, IToken } from '../../model/common';
import { fetchWrapper } from '../http/fetch-wrapper';

export const loginApi = async (email: string, password: string): Promise<DataResponse<IToken>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/login`, {
    email: email,
    password: password,
    role: 'USER',
  });
};

export const logoutApi = async (): Promise<DataResponse<null>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/oauth/revoke`);
};

// export const registerApi = async (
//   data: ISignUpRequest
// ): Promise<DataResponse<any>> => {
//   return fetchWrapper.post(`${API_ENDPOINT}/user/sign-up`, data);
// };
