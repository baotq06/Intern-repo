import crypto, { randomUUID } from 'crypto';
import Logger from '../libs/logger';
const logger = Logger.create('systemToken');

const AESalgorithm = 'aes-256-ecb';
const AESpassword = process.env.SYSTEM_TOKEN_AES_HASH || randomUUID().replaceAll('-', '');

const genSystemToken = (
  /** Timestamp when systemToken start valid. Default value: now */
  ms = Date.now(),
) => {
  try {
    const iv: any = Buffer.from('');
    const cipher = crypto.createCipheriv(AESalgorithm, AESpassword, iv);
    let encrypted = cipher.update(ms.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString('base64');
  } catch (err) {
    logger.error(err);

    return null;
  }
};

const verifySystemToken = (
  /** Token */
  input: string,
  /** LifeTime of token in Ms. Default 1 minute */
  timeInMs = 60 * 1000,
) => {
  try {
    const iv: any = Buffer.from('');
    const decipher = crypto.createDecipheriv(AESalgorithm, AESpassword, iv);
    let decrypted = decipher.update(input, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    // logger.info('decrypted', decrypted);
    const encryptedAt = new Date(+decrypted);
    const now = Date.now();

    return now > encryptedAt.getTime() && encryptedAt.getTime() > now - timeInMs;
  } catch (err: any) {
    logger.error('AES decrypt error', err.message);

    return false;
  }
};

export { genSystemToken, verifySystemToken };
