const raw =
  import.meta.env.VITE_SENTRY_RELEASE || import.meta.env.VITE_APP_VERSION || 'dev';

/** Release tag without a leading v, e.g. `2.0.1` or `dev`. */
export const APP_VERSION = raw.replace(/^v/i, '');
