import { API_ENDPOINT } from '../../constants/env';
import { DataResponse } from '../../model/common';
import { IUserInfo } from '../../model/user';
import { fetchWrapper } from '../http/fetch-wrapper';

export const getUserInfoApi = async (): Promise<DataResponse<IUserInfo>> => {
  return fetchWrapper.get(`${API_ENDPOINT}/user`);
};
export const addBlockedToxicWordsApi = (amount: number) =>
  fetchWrapper.post(`${API_ENDPOINT}/user/update-toxic-words`, { amount });

export const turnOnSecurityApi = async (code: string): Promise<DataResponse<any>> => {
  return fetchWrapper.patch(`${API_ENDPOINT}/user/security/turn-on`, { code });
};
export const turnOffSecurityApi = async (code: string): Promise<DataResponse<any>> => {
  return fetchWrapper.patch(`${API_ENDPOINT}/user/security/turn-off`, { code });
};
export const changeSecurityCodeApi = async (data: {
  oldCode: string;
  newCode: string;
}): Promise<DataResponse<any>> => {
  return fetchWrapper.patch(`${API_ENDPOINT}/user/security/change-code`, data);
};
