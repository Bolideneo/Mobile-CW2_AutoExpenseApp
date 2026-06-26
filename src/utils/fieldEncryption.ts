import CryptoJS from 'crypto-js';
import {DB_ENCRYPTION_KEY} from '../config/encryption';

// crypto-js expects secure random bytes; React Native has no Web Crypto by default.
CryptoJS.lib.WordArray.random = (nBytes: number) => {
  const words: number[] = [];
  for (let i = 0; i < nBytes; i += 4) {
    words.push((Math.random() * 0x100000000) | 0);
  }
  return CryptoJS.lib.WordArray.create(words, nBytes);
};

export const encryptField = (value: string | null | undefined): string | null => {
  if (value == null || value === '') {
    return null;
  }

  try {
    return CryptoJS.AES.encrypt(value, DB_ENCRYPTION_KEY).toString();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Field encryption failed';
    throw new Error(message);
  }
};

export const decryptField = (value: string | null | undefined): string => {
  if (value == null || value === '') {
    return '';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(value, DB_ENCRYPTION_KEY);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    return decoded || value;
  } catch {
    return value;
  }
};
