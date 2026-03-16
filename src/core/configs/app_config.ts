export const APP_CONFIG = {
  appName: 'Sportify Admin Portal',
  version: '1.0.0',
  enableMock: true,
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
} as const

export type AppConfig = typeof APP_CONFIG
