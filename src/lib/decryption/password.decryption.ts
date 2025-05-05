import {IItem} from "@/model/item";
import {decryptionData} from "@/storage/secure-storage";

export const decryptItemField = async (
  params: IItem,
  privateKey: string,
): Promise<IItem> => {
  
  return {
    // ...params,
    id: params.id,
    name: await decryptionData(params.name, privateKey),
    item_type: params.item_type,
    detail_1: params.detail_1
      ? await decryptionData(params.detail_1, privateKey)
      : undefined,
    detail_2: params.detail_2
      ? await decryptionData(params.detail_2, privateKey)
      : undefined,
    detail_3: params.detail_3
      ?  undefined
      : params.detail_3,
    detail_4: params.detail_4
      ? await decryptionData(params.detail_4, privateKey)
      : undefined,
    is_required_master_password: params.is_required_master_password,
    is_pinned: params.is_pinned,
    created_at: params.created_at,
    updated_at: params.updated_at,
    folder_id: params.folder_id,
  };
};
