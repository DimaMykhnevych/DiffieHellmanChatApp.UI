import * as CryptoJS from 'crypto-js';
import { DiffieHellmanPrivateKey } from './diffie-hellman';

export class AES {
  public static encrypt(message: string): string {
    return CryptoJS.AES.encrypt(
      message,
      DiffieHellmanPrivateKey.key
    ).toString();
  }

  public static decrypt(message: string): string {
    return CryptoJS.AES.decrypt(message, DiffieHellmanPrivateKey.key).toString(
      CryptoJS.enc.Utf8
    );
  }
}
