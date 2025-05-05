import {API_ENDPOINT} from "@/constants/env";
import {IBackupKey} from "@/model/backup-key";
import {DataResponse} from "@/model/common";
import {fetchWrapper} from "../http/fetch-wrapper";

export const getBackupKeyApi = async (
  userId: string,
  password: string,
): Promise<DataResponse<IBackupKey>> => {
  return fetchWrapper.post(`${API_ENDPOINT}/backup-key`, {
    userId,
    password,
  });
};
