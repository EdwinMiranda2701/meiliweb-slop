import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    bracketSameLine: true,
    trailingComma: 'all',
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    htmlWhitespaceSensitivity: 'ignore',
    sortTailwindcss: {},
    printWidth: 120,
    sortPackageJson: false,
    ignorePatterns: [
      'build',
      'coverage',
      'dist',
      'pnpm-lock.yaml',
      'README.md',
      'app/auto-imports.d.ts',
      'app/components.d.ts',
    ],
  },
  plugins: lazyPlugins(() => [
    vue(),
    vueI18n({
      defaultSFCLang: 'yaml',
    }),
    tailwindcss(),
    AutoImport({
      dts: 'app/auto-imports.d.ts',
      dirs: ['app/composables', 'app/stores', 'app/utils', 'app/runtime'],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        {
          '@unhead/vue': ['useHead'],
          'vue-i18n': ['useI18n'],
        },
      ],
      vueTemplate: true,
    }),
    Components({
      dts: 'app/components.d.ts',
      dirs: ['app/components'],
    }),
  ]),
  resolve: {
    alias: {
      'v3-infinite-loading': fileURLToPath(
        new URL('./node_modules/v3-infinite-loading/lib/v3-infinite-loading.es.js', import.meta.url),
      ),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
