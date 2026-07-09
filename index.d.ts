declare module 'jwt-encode' {
  const sign: (data: any, key: string) => string
  export default sign
}

declare module '@fontsource-variable/dm-sans'
declare module 'vue3-leaflet'

declare module 'vue3-sortablejs' {
  import type { Plugin } from 'vue'
  const plugin: Plugin
  export default plugin
}
