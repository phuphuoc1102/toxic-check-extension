import {encryptData} from "./../common/common-function";
import {Exception} from "@/error/exception";
import {IBackupKey} from "@/model/backup-key";
import {
  decryptKey,
  decryptPrivateKey,
  saveKeysToStorage,
} from "@/storage/secure-storage";

export const backupCredentialsKey = async (
  email: string,
  backupKey: IBackupKey,
) => {
  try {
    const privateKey = decryptPrivateKey(
      backupKey.client_encryted_private_key,
      email,
    );
    const publicKey = atob(backupKey.client_public_key);
    await saveKeysToStorage(email, publicKey, privateKey);
  } catch (error) {
    throw new Exception("BACKUP_CREDENTIALS_FAILED");
  }
};
