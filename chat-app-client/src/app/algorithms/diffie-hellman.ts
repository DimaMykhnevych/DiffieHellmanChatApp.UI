import { DiffieHellmanConstants } from '../constants/diffie-hellman-constnats';
import * as bigInt from 'big-integer';

export class DiffieHellman {
  public static privateKey?: number;

  constructor() {
    if (DiffieHellman.privateKey === undefined) {
      DiffieHellman.privateKey = this.getRandomArbitrary(1, 200);
    }
  }

  public generatePublicKey(num: bigInt.BigInteger): bigInt.BigInteger {
    return num.modPow(
      bigInt(DiffieHellman.privateKey || 1),
      DiffieHellmanConstants.p
    );
  }

  private getRandomArbitrary(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
}

export class DiffieHellmanPrivateKey {
  public static key: string;
}
