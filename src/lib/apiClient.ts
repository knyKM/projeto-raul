// API Client for communicating with the Node.js backend

const API_URL_KEY = 'mogibens_api_url';

/**
 * Auto-detect API URL based on current domain.
 * Production (Nginx): API proxied at /api on same origin.
 * Development (Vite): localhost:3001.
 */
function detectApiUrl(): string {
  const { hostname, protocol, port, host } = window.location;

  // Dev: localhost, 127.0.0.1, or private/local IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);

  if (isLocal && ['5173', '5174', '8080'].includes(port)) {
    // Vite dev server: API normally runs separately on port 3001.
    return `${protocol}//${hostname}:3001`;
  }

  // Nginx/production/local network: API should be proxied on the same origin.
  return `${protocol}//${host}/api`;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function isLocalOrPrivateHost(hostname: string): boolean {
  return hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
}

function shouldUseStoredUrl(url: string, detected: string): boolean {
  try {
    const stored = new URL(url, window.location.origin);
    const currentHostname = window.location.hostname;

    if (
      isLocalOrPrivateHost(currentHostname) &&
      isLocalOrPrivateHost(stored.hostname) &&
      stored.hostname !== currentHostname
    ) {
      return false;
    }

    if (
      isLocalOrPrivateHost(currentHostname) &&
      !window.location.port &&
      stored.hostname === currentHostname &&
      stored.port === '3001' &&
      normalizeUrl(detected).endsWith('/api')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function getApiUrlCandidates(): string[] {
  const detected = normalizeUrl(detectApiUrl());
  const candidates = [detected];

  const direct = localStorage.getItem(API_URL_KEY);
  if (direct && shouldUseStoredUrl(direct, detected)) candidates.push(normalizeUrl(direct));

  try {
    const configRaw = localStorage.getItem('mogibens_config');
    if (configRaw) {
      const config = JSON.parse(configRaw);
      if (config.apiUrl && shouldUseStoredUrl(config.apiUrl, detected)) {
        candidates.push(normalizeUrl(config.apiUrl));
      }
    }
  } catch {}

  const { hostname, protocol } = window.location;
  if (isLocalOrPrivateHost(hostname)) candidates.push(`${protocol}//${hostname}:3001`);

  return Array.from(new Set(candidates));
}

export function getApiUrl(): string {
  const detected = normalizeUrl(detectApiUrl());

  // 1. Explicit override
  const direct = localStorage.getItem(API_URL_KEY);
  if (direct && shouldUseStoredUrl(direct, detected)) return normalizeUrl(direct);

  // 2. From config store
  try {
    const configRaw = localStorage.getItem('mogibens_config');
    if (configRaw) {
      const config = JSON.parse(configRaw);
      if (config.apiUrl && shouldUseStoredUrl(config.apiUrl, detected)) {
        const normalized = normalizeUrl(config.apiUrl);
        localStorage.setItem(API_URL_KEY, normalized);
        return normalized;
      }
    }
  } catch {}

  // 3. Auto-detect — never returns empty
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
  const candidates = getApiUrlCandidates();
  if (candidates.length === 0) {
    return { ok: false, error: 'API URL não configurada.' };
  }

  let lastError = 'Erro de conexão com a API';

  for (let index = 0; index < candidates.length; index += 1) {
    const baseUrl = candidates[index];

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
      lastError = errBody.error || `Erro ${res.status}`;
      const canTryNext = [404, 502, 503, 504].includes(res.status) && index < candidates.length - 1;
      if (canTryNext) continue;
      return { ok: false, error: lastError };
    }

    const data = await res.json();
    localStorage.setItem(API_URL_KEY, baseUrl);
    return { ok: true, data };
  } catch (err: unknown) {
    lastError = err instanceof Error ? err.message : 'Erro de conexão com a API';
    if (index < candidates.length - 1) continue;
  }
  }

  return { ok: false, error: lastError };
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
