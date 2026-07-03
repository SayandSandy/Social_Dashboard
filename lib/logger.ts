// A wrapper around console.error to eventually be replaced with Sentry

export const logger = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, { error, context });
    // TODO: Add Sentry or other monitoring integration here
    // Sentry.captureException(error, { extra: context });
  },
  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, context);
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context);
  }
};
