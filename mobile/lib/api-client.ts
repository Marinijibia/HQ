import { Platform } from 'react-native';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_HOST) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  async get<T>(path: string, timeoutMs: number = 3000): Promise<{ ok: boolean; data?: T; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      clearTimeout(timer);
      const isTimeout = e.name === 'AbortError';
      return {
        ok: false,
        error: isTimeout ? 'Request timed out' : e.message || 'Network connection failed',
      };
    }
  }

  async post<T>(path: string, body: any, timeoutMs: number = 5000): Promise<{ ok: boolean; data?: T; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      clearTimeout(timer);
      const isTimeout = e.name === 'AbortError';
      return {
        ok: false,
        error: isTimeout ? 'Request timed out' : e.message || 'Network connection failed',
      };
    }
  }

  async patch<T>(path: string, body: any, timeoutMs: number = 5000): Promise<{ ok: boolean; data?: T; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      clearTimeout(timer);
      const isTimeout = e.name === 'AbortError';
      return {
        ok: false,
        error: isTimeout ? 'Request timed out' : e.message || 'Network connection failed',
      };
    }
  }

  async delete<T>(path: string, timeoutMs: number = 5000): Promise<{ ok: boolean; data?: T; error?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      clearTimeout(timer);
      const isTimeout = e.name === 'AbortError';
      return {
        ok: false,
        error: isTimeout ? 'Request timed out' : e.message || 'Network connection failed',
      };
    }
  }
}

export const api = new ApiClient();
