/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_FOLDER_NAME: string
  readonly VITE_THUMB_MAX_SIZE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
