import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/node.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node18',
    outDir: 'dist',
    external: ['neverthrow', 'radashi', '@formkit/tempo', 'pino', 'pino-pretty'],
});
