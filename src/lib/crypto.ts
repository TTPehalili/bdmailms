import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'appointmentlyy-workflow-engine-secret-key-32chars!';

// Ensure key is 32 bytes
const KEY_BUFFER = crypto.createHash('sha256').update(SECRET_KEY).digest();

export function encryptSecret(plainText: string): string {
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.warn('Encryption fallback to base64:', err);
    return `b64:${Buffer.from(plainText).toString('base64')}`;
  }
}

export function decryptSecret(encryptedData: string): string {
  try {
    if (encryptedData.startsWith('b64:')) {
      return Buffer.from(encryptedData.replace('b64:', ''), 'base64').toString('utf8');
    }
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return encryptedData;

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('Decryption failed, returning raw:', err);
    return encryptedData;
  }
}
