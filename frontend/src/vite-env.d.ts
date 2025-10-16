/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // variáveis que você usa
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
