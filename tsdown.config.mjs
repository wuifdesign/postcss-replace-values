import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['lib/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node22',
  platform: 'node',
  dts: true,
  clean: true,
  publint: true,
})
