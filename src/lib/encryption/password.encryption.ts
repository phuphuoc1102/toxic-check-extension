import {CreatePasswordParams} from "@/payload/request/password";
import {encryptionData} from "@/storage/secure-storage";

export const encryptPasswordFields = async (
  params: CreatePasswordParams,
  publicKey: string,
): Promise<CreatePasswordParams> => {
  return {
    ...params,
    name: await encryptionData(params.name, publicKey),
    username: await encryptionData(params.username, publicKey),
    password: await encryptionData(params.password, publicKey),
    url: params.url ? await encryptionData(params.url, publicKey) : undefined,
    note: params.note
      ? await encryptionData(params.note, publicKey)
      : undefined,
  };
};
