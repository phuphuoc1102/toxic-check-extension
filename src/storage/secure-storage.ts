import {Exception} from "@/error/exception";
import {getBackupKeyApi} from "@/lib/services/backupKey.service";
import {backupCredentialsKey} from "@/utils/backup-key";
import forge from "node-forge";
import CryptoJS from "crypto-js";

export const saveKeysToStorage = async (email, publicKey, privateKey) => {
  try {
    const aesKey = await generateAesKey();

    const encryptedPrivateKey = await encryptKey(privateKey, aesKey);
    const encryptedPublicKey = await encryptKey(publicKey, aesKey);

    await chrome.storage.local.set({
      [`${email}-aesKey`]: await exportAesKey(aesKey),
      [`${email}-privateKey`]: encryptedPrivateKey,
      [`${email}-publicKey`]: encryptedPublicKey,
    });

  } catch (error) {
    console.error("Could not store keys:", error);
  }
};

const generateAesKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
};

const encryptKey = async (data, key) => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(data),
  );
  return {iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted))};
};

const exportAesKey = async key => {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};
export const getKeysFromStorage = async email => {
  try {
    const storedData = await chrome.storage.local.get([
      `${email}-aesKey`,
      `${email}-privateKey`,
      `${email}-publicKey`,
    ]);

    if (!storedData[`${email}-aesKey`]) {
      throw new Error("No keys found");
    }

    const aesKey = await importAesKey(storedData[`${email}-aesKey`]);

    const privateKey = await decryptKey(
      storedData[`${email}-privateKey`],
      aesKey,
    );
    const publicKey = await decryptKey(
      storedData[`${email}-publicKey`],
      aesKey,
    );

    return {privateKey, publicKey};
  } catch (error) {
    console.error("Could not retrieve keys:", error);
    throw error;
  }
};

const importAesKey = async keyBase64 => {
  const rawKey = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
};

export const decryptKey = async (encryptedData, key) => {
  const {iv, data} = encryptedData;
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(data),
  );
  return new TextDecoder().decode(decrypted);
};

export const encryptionData = async (
  data: string,
  publicKey: string | null,
): Promise<string> => {
  if (!publicKey) {
    throw new Error("Public key not found");
  }

  try {
    const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);

    // Encode dữ liệu thành URI trước khi mã hóa
    const encodedData = encodeURIComponent(data);

    const encrypted = publicKeyForge.encrypt(encodedData, "RSA-OAEP");
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Error encrypting data");
  }
};

export const decryptionData = async (
  data: string,
  privateKey: string | null,
): Promise<string> => {
  if (!privateKey) {
    throw new Error("Private key not found");
  }

  try {
    const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);

    // Giải mã dữ liệu
    const decrypted = privateKeyForge.decrypt(
      forge.util.decode64(data),
      "RSA-OAEP",
    );

    // Decode lại dữ liệu từ URI
    return decodeURIComponent(decrypted);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Error decrypting data");
  }
};

export const handleBackUpCredentialsKeyFunction = async (
  email: string,
  password: string,
  userId: string,
): Promise<void> => {
  const response = await getBackupKeyApi(userId, password);
  if (!response.data) {
    throw new Exception("BACKUP_KEY_NOT_FOUND");
  }
  await backupCredentialsKey(email, response.data);
};
export const decryptPrivateKey = (
  encryptedObject: string,
  email: string,
): string => {
  try {
    const {encryptedData, salt} = JSON.parse(encryptedObject);
    const key = CryptoJS.PBKDF2(email, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted;
  } catch (error) {
    console.error("Error decrypting key:", error);
    throw new Exception("Error decrypting key");
  }
};
