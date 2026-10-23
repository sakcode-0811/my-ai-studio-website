/**
 * Base REST API service client for Waste Food Reduction System
 */

export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, error.message);
    throw error;
  }
}
