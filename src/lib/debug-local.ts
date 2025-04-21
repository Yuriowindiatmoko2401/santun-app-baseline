/**
 * Local development debugging utilities
 * Only active when USE_LOCAL_SERVICES=true
 */

const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
const DEBUG_PREFIX = '🐞 [DEBUG]';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  component?: string;
  data?: any;
}

/**
 * Debug logger for local development
 */
export const debugLogger = {
  debug: (message: string, options?: LogOptions) => {
    if (isLocalDev) log('debug', message, options);
  },
  
  info: (message: string, options?: LogOptions) => {
    if (isLocalDev) log('info', message, options);
  },
  
  warn: (message: string, options?: LogOptions) => {
    if (isLocalDev) log('warn', message, options);
  },
  
  error: (message: string, options?: LogOptions) => {
    if (isLocalDev) log('error', message, options);
  },
  
  // Component-specific loggers
  redis: (message: string, data?: any) => {
    if (isLocalDev) log('debug', message, { component: 'Redis', data });
  },
  
  auth: (message: string, data?: any) => {
    if (isLocalDev) log('debug', message, { component: 'Auth', data });
  },
  
  realtime: (message: string, data?: any) => {
    if (isLocalDev) log('debug', message, { component: 'Realtime', data });
  },
  
  storage: (message: string, data?: any) => {
    if (isLocalDev) log('debug', message, { component: 'Storage', data });
  }
};

/**
 * Internal logging function
 */
function log(level: LogLevel, message: string, options?: LogOptions) {
  const component = options?.component ? `[${options.component}]` : '';
  const logMessage = `${DEBUG_PREFIX} ${component} ${message}`;
  
  switch (level) {
    case 'debug':
      console.debug(logMessage);
      break;
    case 'info':
      console.info(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    case 'error':
      console.error(logMessage);
      break;
  }
  
  if (options?.data) {
    console.debug(options.data);
  }
}

/**
 * Performance measurement utility for local development
 */
export function measurePerformance(name: string, fn: () => any) {
  if (!isLocalDev) return fn();
  
  console.time(`${DEBUG_PREFIX} ${name} execution time`);
  const result = fn();
  console.timeEnd(`${DEBUG_PREFIX} ${name} execution time`);
  
  return result;
}

/**
 * Async performance measurement utility for local development
 */
export async function measurePerformanceAsync(name: string, fn: () => Promise<any>) {
  if (!isLocalDev) return fn();
  
  console.time(`${DEBUG_PREFIX} ${name} execution time`);
  const result = await fn();
  console.timeEnd(`${DEBUG_PREFIX} ${name} execution time`);
  
  return result;
}
