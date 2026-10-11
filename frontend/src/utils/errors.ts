import axios from 'axios';
import type { ApiError } from '../types';

/**
 * Turns Axios / network failures into a human-readable message, preferring
 * the structured message sent by the backend GlobalExceptionHandlers.
 */
export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiError>(err)) {
    const data = err.response?.data;
    if (data?.fieldErrors) {
      return Object.entries(data.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ');
    }
    if (data?.message) {
      return data.message;
    }
    if (err.code === 'ECONNABORTED') {
      return 'Request timed out - is the backend running?';
    }
    if (!err.response) {
      return 'Cannot reach the server - is the backend running on :8080?';
    }
    return `Request failed with status ${err.response.status}`;
  }
  return 'An unexpected error occurred';
}
