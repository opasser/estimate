import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoinDecryptionService {
  private key = new TextEncoder().encode('1234567890abcdef1234567890abcdef'); // 32 байта

  decrypt$(userData: { userId: string; height: string; width: string }): Observable<string> {
    if (typeof window === 'undefined') {
      return of('0');
    }

    return from(this.decryptNumber(userData.userId, userData.height, userData.width));
  }

  private async decryptNumber(
    encrypted: string,
    iv: string,
    authTag: string
  ): Promise<string> {
    const ivBytes = this.hexToBytes(iv);
    const authTagBytes = this.hexToBytes(authTag);
    const encryptedBytes = this.hexToBytes(encrypted);

    try {
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        this.key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: this.toArrayBuffer(ivBytes), tagLength: 128 },
        cryptoKey,
        new Uint8Array([...encryptedBytes, ...authTagBytes])
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      console.error('Decryption error:', e);
      return "0";
    }
  }

  private toArrayBuffer(u8: Uint8Array): ArrayBuffer {
    return <ArrayBuffer>u8.buffer.slice(
      u8.byteOffset,
      u8.byteOffset + u8.byteLength
    );
  }

  private hexToBytes(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }
}
