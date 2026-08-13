import { defineConfig } from 'vite';
import vitePluginSingleSpa from 'vite-plugin-single-spa';
import mkcert from 'vite-plugin-mkcert'
import { ViteEjsPlugin } from "vite-plugin-ejs";
import fs from 'node:fs';

const headContent = fs.readFileSync('./src/head.html', 'utf-8');

export default defineConfig((env) => {
  return {
    server: {
      port: 4700,
      proxy: {
        "^/sv-asset/.*": {
          target: "https://localhost:5001",
          changeOrigin: true,
          secure: false
        },
        "^/sv-asset-mob/.*": {
          target: "https://localhost:5002",
          changeOrigin: true,
          secure: false
        },
      }
    },
    preview: {
      port: 4100,
      proxy: {
        "^/sv-asset/.*": {
          target: "https://localhost:4100",
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace('/sv-asset', '/microfrontends/sv-desktop-app/sv-asset'),
        },
        "^/sv-asset-mob/.*": {
          target: "https://localhost:4100",
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace('/sv-asset-mob', '/microfrontends/sv-mobile-app/sv-asset-mob'),
        },
      }
    },
    build: {
      minify: 'esbuild'
    },

    plugins: [
      mkcert({
        savePath: ".certs",
      }),
      ViteEjsPlugin((viteConfig) => {
        return { headContent: headContent }
      }),
      vitePluginSingleSpa({
        type: 'root',
        imo: () => '/import-map-overrides@4.2.0.js',
        imoUi: false
      }),
    ]
  }
})
