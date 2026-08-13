import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig((config) => {
  return { plugins: [tailwindcss(), sveltekit(),
    mkcert({
        savePath: ".certs",
      })
  ], }
});
