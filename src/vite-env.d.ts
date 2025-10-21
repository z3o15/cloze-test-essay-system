/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_VOLCANO_API_KEY: string
  readonly VITE_VOLCANO_API_URL: string
  readonly VITE_BAIDU_APP_ID: string
  readonly VITE_BAIDU_SECRET_KEY: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}