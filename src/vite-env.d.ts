/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_CORE_URL?: string;
  readonly VITE_DEFAULT_CLIENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
