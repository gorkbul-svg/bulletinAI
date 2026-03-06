// src/lib/crypto.ts
// AES-256-GCM encryption for sensitive credentials (access tokens, secrets)
// Key must be 32-byte hex string stored in ENCRYPTION_KEY env var

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG     = "aes-256-gcm";
const KEY_HEX = process.env.ENCRYPTION_KEY!;           // 64 hex chars = 32 bytes
const KEY     = Buffer.from(KEY_HEX, "hex");

export function encrypt(plaintext: string): string {
  const iv  = randomBytes(12);                         // 96-bit IV for GCM
  const cipher = createCipheriv(ALG, KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv(24) + ":" + tag(32) + ":" + ciphertext(hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decrypt(encoded: string): string {
  const [ivHex, tagHex, encHex] = encoded.split(":");
  const iv      = Buffer.from(ivHex,  "hex");
  const tag     = Buffer.from(tagHex, "hex");
  const enc     = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALG, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
