import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// ADR 0010: a entrada principal `@gfg/ui` é TypeScript puro. Só `src/native/` pode usar React.
const srcDir = dirname(fileURLToPath(import.meta.url));

describe('fronteira do pacote', () => {
  it('nenhum arquivo fora de src/native importa react ou react-native', () => {
    const files = readdirSync(srcDir).filter((name) => /\.tsx?$/.test(name));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(join(srcDir, file), 'utf8');
      expect(source, file).not.toMatch(/from ['"]react(-native)?['"]/);
      expect(source, file).not.toMatch(/from ['"]\.\/native/);
    }
  });
});
