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
  return fetchWrapper.post(`${API_ENDPOINT}/user/logout`);
};

export const registerApi = async (data: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/register`, data);
};
export const verifyPinApi = async (data: {
  code: string;
  email: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/email/verify`, data);
};

export const forgotPasswordApi = async (email: string): Promise<DataResponse<any>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/email/password`, { email });
};

export const verifyCodeForgotPassword = async (data: {
  email: string;
  code: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/email/password/verify`, data);
};

export const resetPasswordApi = async (data: {
  confirmPassword: string;
  email: string;
  password: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/auth/password/reset`, data);
};

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

export const changePasswordApi = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.patch(`${API_ENDPOINT}/user/change-password`, data);
};
