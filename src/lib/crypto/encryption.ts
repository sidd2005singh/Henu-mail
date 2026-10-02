/**
 * HENU MAIL - Cryptographic Security Module
 * HENU OS PRIVATE LIMITED
 *
 * AES-256-GCM authenticated encryption for sensitive credentials and OAuth tokens.
 * Plaintext passwords and raw tokens are NEVER stored in plaintext or exposed to frontend JS.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

// Secret key derivation (32 bytes / 256 bits)
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || "henu-mail-secure-encryption-key-32b-default";
  return crypto.createHash("sha256").update(String(secret)).digest();
}

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  tag: string; // Base64
}

/**
 * Encrypts a sensitive string using AES-256-GCM with authenticated tag.
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // Serialized format: iv:tag:ciphertext (all hex encoded)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, tagHex, ciphertextHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Masks a token or email address for display in frontend telemetry.
 */
export function maskCredential(str: string, visibleChars = 4): string {
  if (!str) return "••••••••";
  if (str.length <= visibleChars * 2) return "••••••••";
  return `${str.slice(0, visibleChars)}••••${str.slice(-visibleChars)}`;
}
