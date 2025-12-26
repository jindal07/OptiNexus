/**
 * Error sanitization utilities
 * Prevents exposure of sensitive data (API keys, tokens, etc.) in logs and responses
 */

/**
 * Sanitize error message to remove sensitive information
 * @param {string} message - Error message to sanitize
 * @returns {string} - Sanitized error message
 */
export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return 'An error occurred';
  }

  // Remove potential API keys, tokens, and sensitive patterns
  let sanitized = message
    // Remove API keys (common patterns)
    .replace(/api[_-]?key["\s:=]+([a-zA-Z0-9_-]{20,})/gi, 'api_key=[REDACTED]')
    .replace(/CLOUDCONVERT[_\s]*API[_\s]*KEY["\s:=]+([a-zA-Z0-9_-]+)/gi, 'CLOUDCONVERT_API_KEY=[REDACTED]')
    .replace(/token["\s:=]+([a-zA-Z0-9_-]{20,})/gi, 'token=[REDACTED]')
    // Remove authorization headers
    .replace(/authorization["\s:]+([^\s"]+)/gi, 'authorization=[REDACTED]')
    // Remove bearer tokens
    .replace(/bearer\s+([a-zA-Z0-9_-]+)/gi, 'bearer [REDACTED]')
    // Remove any long alphanumeric strings that might be keys
    .replace(/([a-zA-Z0-9_-]{32,})/g, (match) => {
      // Only redact if it looks like a key/token (long alphanumeric)
      if (match.length >= 32) {
        return '[REDACTED]';
      }
      return match;
    });

  return sanitized;
}

/**
 * Get safe error message for logging
 * @param {Error|any} error - Error object
 * @returns {string} - Safe error message for logging
 */
export function getSafeErrorMessage(error) {
  if (!error) {
    return 'Unknown error';
  }

  // If it's a string, sanitize it
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error);
  }

  // If it's an Error object, sanitize the message
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message || error.toString());
  }

  // If it has a message property, sanitize it
  if (error.message) {
    return sanitizeErrorMessage(error.message);
  }

  // Fallback to string representation (sanitized)
  return sanitizeErrorMessage(String(error));
}

/**
 * Get safe error object for logging (only includes safe properties)
 * @param {Error|any} error - Error object
 * @returns {object} - Safe error object with only non-sensitive properties
 */
export function getSafeErrorForLogging(error) {
  if (!error) {
    return { message: 'Unknown error' };
  }

  const safe = {
    message: getSafeErrorMessage(error),
    name: error.name || 'Error',
  };

  // Only include status/statusCode if it's a number (safe)
  if (typeof error.status === 'number') {
    safe.status = error.status;
  }
  if (typeof error.statusCode === 'number') {
    safe.statusCode = error.statusCode;
  }

  // Include stack trace only in development (not in production)
  if (process.env.NODE_ENV === 'development' && error.stack) {
    safe.stack = sanitizeErrorMessage(error.stack);
  }

  return safe;
}

