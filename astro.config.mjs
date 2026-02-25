// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://urbinaarmando.github.io',
  base: '/astro-genshin',
  vite: {
    plugins: [tailwindcss()]
  }
});