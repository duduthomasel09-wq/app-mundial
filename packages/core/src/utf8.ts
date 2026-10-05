/**
 * Texto ↔ bytes UTF-8, sem depender de `TextEncoder`/`TextDecoder` (nem todo motor
 * JavaScript do celular tem os dois). Usado para criptografar a sessão do app (ADR 0018).
 */

export function encodeUtf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0x7f) {
      bytes.push(code);
    } else if (code <= 0x7ff) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

/** Decodifica UTF-8. Bytes inválidos geram erro (o dado foi corrompido ou adulterado). */
export function decodeUtf8(bytes: Uint8Array): string {
  let result = '';
  let index = 0;
  const continuation = (offset: number): number => {
    const byte = bytes[index + offset];
    if (byte === undefined || (byte & 0xc0) !== 0x80) throw new Error('UTF-8 inválido');
    return byte & 0x3f;
  };
  while (index < bytes.length) {
    const first = bytes[index] ?? 0;
    let code: number;
    let size: number;
    if (first < 0x80) {
      code = first;
      size = 1;
    } else if ((first & 0xe0) === 0xc0) {
      code = ((first & 0x1f) << 6) | continuation(1);
      size = 2;
    } else if ((first & 0xf0) === 0xe0) {
      code = ((first & 0x0f) << 12) | (continuation(1) << 6) | continuation(2);
      size = 3;
    } else if ((first & 0xf8) === 0xf0) {
      code =
        ((first & 0x07) << 18) | (continuation(1) << 12) | (continuation(2) << 6) | continuation(3);
      size = 4;
    } else {
      throw new Error('UTF-8 inválido');
    }
    result += String.fromCodePoint(code);
    index += size;
  }
  return result;
}
