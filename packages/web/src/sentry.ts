import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE
  });
} else if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info('[sentry] Disabled - VITE_SENTRY_DSN not provided');
}

export { Sentry };
