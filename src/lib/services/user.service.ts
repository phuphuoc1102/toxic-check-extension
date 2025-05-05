import { API_ENDPOINT } from "../../constants/env";
import { DataResponse } from "../../model/common";
import { IUserInfo } from "../../model/user";
import { fetchWrapper } from "../http/fetch-wrapper";

export const getUserInfoApi = async (): Promise<DataResponse<IUserInfo>> => {
  return fetchWrapper.get(`${API_ENDPOINT}/user`);
}