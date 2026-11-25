/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Game server URL, e.g. https://sketchy.onrender.com. Empty = same origin. */
  readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
