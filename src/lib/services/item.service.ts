import {DataResponse} from "@/model/common";
import {fetchWrapper} from "../http/fetch-wrapper";
import {API_ENDPOINT} from "../../constants/env";
import {IPassword} from "@/model/password";
import {IItem} from "@/model/item";

export const getRecentlyUsed = async (): Promise<DataResponse<IItem[]>> => {
  return fetchWrapper.get(`${API_ENDPOINT}/item/get-list-recently-used`);
};
