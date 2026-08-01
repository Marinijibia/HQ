import { Platform } from 'react-native';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://10.101.195.22:3001';

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

  async get<T>(path: string): Promise<{ ok: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network connection failed' };
    }
  }

  async post<T>(path: string, body: any): Promise<{ ok: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const data = await response.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network connection failed' };
    }
  }
}

export const api = new ApiClient();
