import { describe, expect, it } from 'vitest';

import { utf8ByteLength } from './password';
import { decodeUtf8, encodeUtf8 } from './utf8';

describe('UTF-8', () => {
  const samples = ['', 'abc', 'ação €', '😀 emoji', '{"access_token":"x.y.z","user":{"id":"1"}}'];

  it('ida e volta sem perder nada', () => {
    for (const text of samples) expect(decodeUtf8(encodeUtf8(text))).toBe(text);
  });

  it('mesmo resultado do TextEncoder/TextDecoder', () => {
    for (const text of samples) {
      expect(Array.from(encodeUtf8(text))).toEqual(Array.from(new TextEncoder().encode(text)));
      expect(decodeUtf8(new TextEncoder().encode(text))).toBe(text);
    }
  });

  it('tamanho em bytes bate com a regra da senha', () => {
    for (const text of samples) expect(encodeUtf8(text).length).toBe(utf8ByteLength(text));
  });

  it('bytes inválidos geram erro', () => {
    expect(() => decodeUtf8(Uint8Array.from([0xc3]))).toThrow();
    expect(() => decodeUtf8(Uint8Array.from([0xff]))).toThrow();
    expect(() => decodeUtf8(Uint8Array.from([0xe2, 0x28, 0xa1]))).toThrow();
  });
});
