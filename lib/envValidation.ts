/**
 * Environment Variable Validation
 * 
 * Ensures all required environment variables are set securely
 * and provides helpful error messages if misconfigured.
 */

export function validateEnvironment() {
  const errors: string[] = [];
  
  // Check if USE_MOCK_DATA is set
  if (typeof process.env.USE_MOCK_DATA === 'undefined') {
    errors.push('USE_MOCK_DATA environment variable is not set');
  }
  
  // If not in mock mode, validate API credentials
  if (process.env.USE_MOCK_DATA === 'false') {
    if (!process.env.PCO_CLIENT_ID) {
      errors.push('PCO_CLIENT_ID is required when USE_MOCK_DATA=false');
    }
    
    if (!process.env.PCO_CLIENT_SECRET) {
      errors.push('PCO_CLIENT_SECRET is required when USE_MOCK_DATA=false');
    }
    
    // Warn if credentials look suspicious (basic check)
    if (process.env.PCO_CLIENT_ID && process.env.PCO_CLIENT_ID.length < 10) {
      errors.push('PCO_CLIENT_ID appears to be invalid (too short)');
    }
    
    if (process.env.PCO_CLIENT_SECRET && process.env.PCO_CLIENT_SECRET.length < 10) {
      errors.push('PCO_CLIENT_SECRET appears to be invalid (too short)');
    }
  }
  
  // Check for common security misconfigurations
  if (process.env.NODE_ENV === 'production') {
    // Ensure sensitive debug options are disabled in production
    if (process.env.DEBUG === 'true') {
      errors.push('DEBUG mode should be disabled in production');
    }
  }
  
  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }
  
  return {
    valid: true,
    errors: [],
  };
}

/**
 * Sanitizes error messages to prevent leaking sensitive information
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, return generic error messages only
    return 'An error occurred. Please contact support if the issue persists.';
  }
  
  // In development, return actual error (but never log sensitive data)
  if (error instanceof Error) {
    // Remove any potential sensitive data patterns
    let message = error.message;
    
    // Remove potential API keys/tokens (basic pattern matching)
    message = message.replace(/[A-Za-z0-9]{32,}/g, '[REDACTED]');
    
    // Remove email addresses
    message = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');
    
    // Remove potential passwords/secrets
    message = message.replace(/(password|secret|token|key)[=:]\s*\S+/gi, '$1=[REDACTED]');
    
    return message;
  }
  
  return 'Unknown error occurred';
}

/**
 * Checks if environment is secure for production deployment
 */
export function isProductionReady(): { ready: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV should be set to "production"');
  }
  
  // Check that mock data is disabled
  if (process.env.USE_MOCK_DATA === 'true') {
    warnings.push('USE_MOCK_DATA should be "false" in production');
  }
  
  // Check API credentials are set
  if (!process.env.PCO_CLIENT_ID || !process.env.PCO_CLIENT_SECRET) {
    warnings.push('Planning Center API credentials must be configured');
  }
  
  // Check for development-only settings
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'true') {
    warnings.push('API mocking should be disabled in production');
  }
  
  return {
    ready: warnings.length === 0,
    warnings,
  };
}

