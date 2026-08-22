/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_APP_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
