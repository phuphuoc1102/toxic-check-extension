import { API_ENDPOINT } from '../../constants/env';
import { DataResponse, IGoogleToken, IToken } from '../../model/common';
import { fetchWrapper } from '../http/fetch-wrapper';

export const loginApi = async (email: string, password: string): Promise<DataResponse<IToken>> => {
  const user_agent = navigator.userAgent;

  let device_id = localStorage.getItem('device_id');
  if (!device_id) {
    device_id = crypto.randomUUID();
    localStorage.setItem('device_id', device_id);
  }

  return fetchWrapper.post(`${API_ENDPOINT}/auth/login`, {
    email,
    password,
    user_agent,
    device_id,
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
export const googleLoginApi = async ({
  email,
  name,
  photo,
  userAgent,
  deviceId,
}: {
  email: string;
  name?: string;
  photo?: string;
  userAgent: string;
  deviceId: string;
}): Promise<DataResponse<IGoogleToken>> => {
  console.log('Sending to /auth/login/google:', { email, name, photo, userAgent, deviceId });
  return fetchWrapper.post(`${API_ENDPOINT}/auth/login/google`, {
    email,
    name,
    photo,
    userAgent,
    deviceId,
  });
};
