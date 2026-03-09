// API Client for communicating with the Node.js backend

const API_URL_KEY = 'mogibens_api_url';

/**
 * Auto-detect API URL based on current domain.
 * Production (Nginx): API proxied at /api on same origin.
 * Development (Vite): localhost:3001.
 */
function detectApiUrl(): string {
  const { hostname, protocol, port } = window.location;

  // Dev: localhost, 127.0.0.1, or private/local IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);

  if (isLocal) {
    // Use same IP so the browser can reach the backend from the same machine
    return `${protocol}//${hostname}:3001`;
  }

  // Production: always /api on the same origin
  return `${protocol}//${hostname}/api`;
}

export function getApiUrl(): string {
  // 1. Explicit override
  const direct = localStorage.getItem(API_URL_KEY);
  if (direct) return direct;

  // 2. From config store
  try {
    const configRaw = localStorage.getItem('mogibens_config');
    if (configRaw) {
      const config = JSON.parse(configRaw);
      if (config.apiUrl) {
        localStorage.setItem(API_URL_KEY, config.apiUrl.replace(/\/+$/, ''));
        return config.apiUrl;
      }
    }
  } catch {}

  // 3. Auto-detect — never returns empty
  const detected = detectApiUrl();
  localStorage.setItem(API_URL_KEY, detected);
  return detected;
}

export function setApiUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url.replace(/\/+$/, ''));
}

export function isApiConfigured(): boolean {
  return true; // always configured via auto-detect
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    return { ok: false, error: 'API URL não configurada.' };
  }

  try {
    const token = localStorage.getItem('sistemaleads_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { ok: false, error: errBody.error || `Erro ${res.status}` };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro de conexão com a API';
    return { ok: false, error: message };
  }
}

// Health check — test if the API is reachable
export async function testApiConnection(): Promise<ApiResponse<{ status: string }>> {
  return request<{ status: string }>('GET', '/health');
}

// Test database connection with provided credentials
export async function testDbConnection(dbConfig: {
  host: string;
  port: string;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}): Promise<ApiResponse<{ connected: boolean }>> {
  return request<{ connected: boolean }>('POST', '/config/test-db', dbConfig);
}

// Save full configuration to the backend (persisted in DB)
export async function saveConfigToApi(config: Record<string, unknown>): Promise<ApiResponse> {
  return request('POST', '/config', config);
}

// Load configuration from the backend
export async function loadConfigFromApi(): Promise<ApiResponse<Record<string, unknown>>> {
  return request<Record<string, unknown>>('GET', '/config');
}

// Validate a license key
export async function validateLicense(key: string): Promise<ApiResponse<{ valid: boolean; tier: string }>> {
  return request<{ valid: boolean; tier: string }>('POST', '/config/validate-license', { key });
}

// Generic CRUD helpers for other modules (leads, ads, etc.)
export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
