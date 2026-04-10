import CryptoJS from 'crypto-js';

let hasLoggedEnc = false;

const SECRET_SALT = import.meta.env.VITE_ENCRYPTION_SALT || 'nexus_fallback_salt_3399';

/**
 * Generate a unique encryption key for a user based on their UID.
 */
const getEncryptionKey = (userId) => {
  return `${userId}_${SECRET_SALT}`;
};

/**
 * Encrypt a string using AES-256.
 * Returns the original text if it's not a string or empty.
 */
export const encryptData = (text, userId) => {
  if (!text || typeof text !== 'string' || !userId) return text;
  try {
    if (!hasLoggedEnc) {
      console.log('🔐 [Crypto] First encryption successful.');
      hasLoggedEnc = true;
    }
    return CryptoJS.AES.encrypt(text, getEncryptionKey(userId)).toString();
  } catch (err) {
    console.error('Encryption Error:', err);
    return text;
  }
};

/**
 * Decrypt a string using AES-256.
 * If decryption fails or the input is not encrypted, returns the original text (Safe Fallback).
 */
export const decryptData = (ciphertext, userId) => {
  if (!ciphertext || typeof ciphertext !== 'string' || !userId) return ciphertext;
  
  // Quick check: If it doesn't look like base64-ish (AES output), skip
  if (ciphertext.length < 10) return ciphertext;

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey(userId));
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // Fallback: If result is empty, it probably wasn't encrypted or wrong key
    return originalText || ciphertext;
  } catch (err) {
    // Silent fallback for old plain-text data
    return ciphertext;
  }
};
