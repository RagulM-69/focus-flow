/**
 * FocusFlow API Client
 * Centralizes request building, header injection, and error handling.
 */

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export interface ApiError {
  message: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Helper to perform POST requests.
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const targetUrl = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Future hooks for authentication can be injected here
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `Request failed with status code ${response.status}`,
          status: response.status
        };
        throw error;
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err.message && err.status) {
        throw err;
      }
      throw {
        message: err.message || 'A network error occurred. Please check your connection.'
      } as ApiError;
    }
  }

  /**
   * Checks if the API URL is configured.
   */
  isConfigured(): boolean {
    return !!this.baseUrl;
  }
}

export const apiClient = new ApiClient(API_URL);
