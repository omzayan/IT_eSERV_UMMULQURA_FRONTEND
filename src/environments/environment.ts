export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:44311/',
  apiTimeout: 10000,
  builderApiKey: '9406d5e2fe4a4374834c92d95086ff56',
  enableLogging: true,
  enableDevTools: true,
  cacheTimeout: 60000, // 1 minute
  maxRetryAttempts: 1,
  appVersion: '1.0.0-dev',
  features: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: false,
  },
};
