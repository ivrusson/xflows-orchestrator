import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: false, // Temporalmente deshabilitado para evitar errores de tipos
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
    },
  ],
});
