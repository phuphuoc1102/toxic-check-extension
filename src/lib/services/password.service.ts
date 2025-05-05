import {DataResponse} from "@/model/common";
import {fetchWrapper} from "../http/fetch-wrapper";
import {API_ENDPOINT} from "../../constants/env";
import {IPassword} from "@/model/password";
import {encryptionData} from "@/common/common-function";
import {CreatePasswordParams} from "@/payload/request/password";

export const getTmpPasswordApi = async (
  hostname: string,
): Promise<DataResponse<IPassword[]>> => {
  return fetchWrapper.get(`${API_ENDPOINT}/vault`);
};
export const createPassword = async (
  params: CreatePasswordParams,
): Promise<DataResponse<IPassword>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/password/`, params);
};
