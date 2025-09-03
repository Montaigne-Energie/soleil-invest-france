/**
 * Secure logging utility that only logs in development mode
 * Prevents sensitive information from being logged in production
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

/**
 * Sanitizes error messages to prevent sensitive information leakage
 */
export const getSafeErrorMessage = (error: any): string => {
  if (!error) return 'Une erreur inattendue est survenue';
  
  // Known safe error messages
  const safeMessages = [
    'Invalid login credentials',
    'User already registered',
    'Email not confirmed',
    'Password should be at least 6 characters',
    'Invalid email format'
  ];
  
  const errorMessage = error.message || error.error_description || String(error);
  
  // Return safe messages as-is
  if (safeMessages.some(safe => errorMessage.includes(safe))) {
    return errorMessage;
  }
  
  // For development, show full error details
  if (isDevelopment) {
    return errorMessage;
  }
  
  // For production, return generic message to prevent information disclosure
  return 'Une erreur est survenue. Veuillez réessayer.';
};