import { ConfigEnv, defineConfig, mergeConfig, type UserConfig } from 'vite';
import vitePluginSingleSpa from 'vite-plugin-single-spa';
import MainViteConfig from './vite.config';

export default defineConfig((configEnv: ConfigEnv) => {
  const sspaConfig: UserConfig = {
    plugins: [
      vitePluginSingleSpa({
        type: 'mife',
        serverPort: 5001,
        cssStrategy: 'multiMife',
        spaEntryPoints: [
          'src/lib/microfrontends/profile/sspa-profile.js',
          'src/lib/microfrontends/markets/sspa-markets.js'
        ],
        assetFileNames: 'sv-asset/[name][hash][extname]'
      })
    ],
  }
  return mergeConfig(MainViteConfig(configEnv), sspaConfig)
})