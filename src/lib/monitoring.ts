import * as Sentry from "@sentry/react";

function stripQueryString(value?: string) {
  if (!value) return value;

  try {
    const url = new URL(value, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

export function initializeMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn) return;

  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() || import.meta.env.MODE;

  Sentry.init({
    dsn,
    enabled: import.meta.env.PROD,
    environment,
    release: __SENTRY_RELEASE__,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    initialScope: {
      tags: {
        app_version: __APP_VERSION__,
        build_date: __APP_BUILD_DATE__,
      },
    },
    beforeSend(event) {
      if (event.user) {
        event.user = event.user.id ? { id: event.user.id } : undefined;
      }

      if (event.request) {
        event.request.url = stripQueryString(event.request.url);
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
      }

      return event;
    },
  });
}

export function captureAppError(error: unknown, context?: Record<string, unknown>) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
