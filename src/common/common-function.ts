import JSEncrypt from "jsencrypt";
import CryptoJS from "crypto-js";

export const encryptionData = (
  data: string,
  publicKey: string | null,
): string => {
  if (!publicKey) {
    throw new Error("Public key not found");
  }

  try {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);

    const encrypted = encryptor.encrypt(data);
    if (!encrypted) {
      throw new Error("Encryption failed");
    }

    return encrypted;
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Error encrypting data");
  }
};

export const decryptionData = (
  data: string,
  privateKey: string | null,
): string => {
  if (!privateKey) {
    throw new Error("Private key not found");
  }

  try {
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(privateKey);

    const decrypted = decryptor.decrypt(data);
    if (!decrypted) {
      throw new Error("Decryption failed");
    }

    return decrypted;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Error decrypting data");
  }
};
// export const generateKeyAndSalt = (
//   email: string,
//   password: string,
// ): {key: string; salt: string} => {
//   const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
//   const key = CryptoJS.PBKDF2(password + email, salt, {
//     keySize: 256 / 32,
//     iterations: 1000,
//   }).toString();
//   return {key, salt};
// };

export const encryptData = (
  plaintext: string,
  email: string,
  password: string,
): string => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString() + email;
  const key = CryptoJS.PBKDF2(password + email, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
  const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
  return JSON.stringify({encryptedData: encrypted, salt: salt});
};

export const decryptData = (
  encryptedObject: string,
  email: string,
  password: string,
): string => {
  const {encryptedData, salt} = JSON.parse(encryptedObject);
  const key = CryptoJS.PBKDF2(password + email, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  return decrypted;
};
export const getDomainFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const domain = hostname.startsWith("www.") ? hostname : `www.${hostname}`;

    const iconUrl = "https://icons.duckduckgo.com/ip3/" + domain + ".ico";

    console.log("Parsed URL:", iconUrl);
    return iconUrl;
  } catch (error) {
    console.error("Invalid URL:", url);
    return "./icons/default_password.png";
  }
};

