import { writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import type { UserConfig } from 'vite';

import { visualizer } from 'rollup-plugin-visualizer';
import { checker } from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

import pkg from './package.json';

const getViteEnv = (mode: string, target: string) => {
  return loadEnv(mode, process.cwd())[target];
};
/**
 * Vite Configure
 *
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig(({ command, mode }): UserConfig => {
  const config: UserConfig = {
    // clearScreen: false,
    optimizeDeps: {
      exclude: ['vuetify'],
    },
    css: {
      preprocessorMaxWorkers: true,
    },
    // https://vitejs.dev/config/shared-options.html#base
    base: '/',
    // https://vitejs.dev/config/shared-options.html#define
    define: { 'process.env': {} },
    plugins: [
      // Vue3
      vue({
        template: {
          // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin#image-loading
          transformAssetUrls,
        },
      }),
      // Vuetify Loader
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
      vuetify({
        autoImport: true,
        // styles: { configFile: 'src/styles/settings.scss' },
      }),
      // vite-plugin-static-copy
      // https://github.com/sapphi-red/vite-plugin-static-copy
      viteStaticCopy({
        targets: [
          {
            src: 'portalConfig.json',
            dest: '',
          },
        ],
      }),
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: true,
        // vueTsc: true,
        // eslint: { lintCommand: 'eslint' },
        // stylelint: { lintCommand: 'stylelint' },
      }),
      createSvgIconsPlugin({
        iconDirs: [
          fileURLToPath(
            new URL('./src/assets/images/menuIcon', import.meta.url)
          ),
        ],
        symbolId: 'icon-[name]',
        svgoOptions: {
          plugins: [
            {
              name: 'removeAttributesBySelector',
              params: {
                selector: ":not([fill='none'])",
                attributes: 'fill',
              },
            },
            {
              name: 'removeAttrs',
              params: {
                attrs: 'class',
              },
            },
          ],
        },
      }),
    ],
    // https://vitejs.dev/config/server-options.html
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
    preview: {
      port: 5173,
    },
    // Resolver
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    // Build Options
    // https://vitejs.dev/config/build-options.html
    build: {
      outDir: path.join(__dirname, getViteEnv(mode, 'VITE_APP_OUTPUT_PATH')),
      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: 'esnext',
      // Minify option
      // https://vitejs.dev/config/build-options.html#build-minify
      minify: 'terser',
      terserOptions: {
        compress: {
          // drop_console: ['log', 'info', 'debug', 'warn'],
          drop_debugger: true,
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.warn',
          ],
        },
      },
      // Rollup Options
      // https://vitejs.dev/config/build-options.html#build-rollupoptions
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[ext]/asset-[hash][extname]',
          chunkFileNames: 'js/chunk-[hash].js',
          manualChunks: {
            // Split external library from transpiled code.
            vue: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
            vuetify: [
              'vuetify',
              'vuetify/components',
              'vuetify/directives',
              // 'vuetify/lib/labs',
              'webfontloader',
            ],
            materialdesignicons: ['@mdi/font/css/materialdesignicons.css'],
          },
          plugins: [
            mode === 'analyze'
              ? // rollup-plugin-visualizer
                // https://github.com/btd/rollup-plugin-visualizer
                visualizer({
                  open: true,
                  filename: 'dist/stats.html',
                })
              : undefined,
          ],
        },
      },
    },
    esbuild: {
      // Drop console when production build.
      drop: command === 'serve' ? [] : ['console'],
    },
  };

  // Write meta data.
  writeFileSync(
    fileURLToPath(new URL('./src/Meta.ts', import.meta.url)),
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `import type MetaInterface from '@/interfaces/MetaInterface';

// This file is auto-generated by the build system.
const meta: MetaInterface = {
  version: '${pkg.version}',
  date: '${new Date().toISOString()}',
};
export default meta;
`
  );

  return config;
});
